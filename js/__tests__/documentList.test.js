/**
 * @jest-environment jsdom
 */

describe('DocumentList', () => {
    let documentList;
    let container;
    let mockDocumentManager;

    // Mock document data
    const mockDocuments = [
        {
            id: 1,
            name: 'Insurance Policy.pdf',
            type: 'policy',
            size: 1024576, // 1MB
            mimeType: 'application/pdf',
            url: 'documents/policy123.pdf',
            status: 'active',
            uploadedAt: '2023-12-01T10:00:00Z',
            tags: ['policy', 'auto'],
            versions: [{ number: 1, timestamp: '2023-12-01T10:00:00Z' }]
        },
        {
            id: 2,
            name: 'Quote Request.docx',
            type: 'quote',
            size: 512000, // 500KB
            mimeType: 'application/docx',
            url: 'documents/quote456.docx',
            status: 'active',
            uploadedAt: '2023-12-02T14:30:00Z',
            tags: ['quote', 'home'],
            versions: [{ number: 1, timestamp: '2023-12-02T14:30:00Z' }]
        }
    ];

    beforeEach(() => {
        // Create container element
        container = document.createElement('div');
        container.id = 'documentListView';
        document.body.appendChild(container);

        // Mock DocumentManager
        mockDocumentManager = {
            documents: [...mockDocuments],
            searchDocuments: jest.fn().mockImplementation(query => 
                mockDocuments.filter(doc => 
                    doc.name.toLowerCase().includes(query.toLowerCase()) ||
                    doc.type.toLowerCase().includes(query.toLowerCase())
                )
            ),
            addDocument: jest.fn().mockImplementation((clientId, doc) => ({
                id: Date.now(),
                status: 'active',
                uploadedAt: new Date().toISOString(),
                versions: [{ number: 1, timestamp: new Date().toISOString() }],
                ...doc
            }))
        };

        // Mock window.DocumentManager
        window.DocumentManager = jest.fn().mockImplementation(() => mockDocumentManager);

        // Initialize DocumentList
        documentList = new DocumentList('documentListView');
        documentList.initialize();
    });

    afterEach(() => {
        document.body.removeChild(container);
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        test('should render document manager container', () => {
            expect(container.querySelector('.document-manager')).toBeTruthy();
            expect(container.querySelector('.document-header')).toBeTruthy();
            expect(container.querySelector('.document-filters')).toBeTruthy();
            expect(container.querySelector('.document-container')).toBeTruthy();
        });

        test('should initialize with grid view by default', () => {
            expect(documentList.currentView).toBe('grid');
            expect(container.querySelector('.grid-view')).toBeTruthy();
        });

        test('should load initial documents', () => {
            const documentCards = container.querySelectorAll('.document-card');
            expect(documentCards.length).toBe(mockDocuments.length);
        });
    });

    describe('View Toggling', () => {
        test('should switch between grid and list views', () => {
            const listViewButton = container.querySelector('[data-view="list"]');
            listViewButton.click();

            expect(documentList.currentView).toBe('list');
            expect(container.querySelector('.document-table')).toBeTruthy();

            const gridViewButton = container.querySelector('[data-view="grid"]');
            gridViewButton.click();

            expect(documentList.currentView).toBe('grid');
            expect(container.querySelector('.document-card')).toBeTruthy();
        });
    });

    describe('Filtering and Searching', () => {
        test('should filter by document type', () => {
            const typeFilter = container.querySelector('#typeFilter');
            typeFilter.value = 'policy';
            typeFilter.dispatchEvent(new Event('change'));

            const documentCards = container.querySelectorAll('.document-card');
            expect(documentCards.length).toBe(1);
            expect(documentCards[0].textContent).toContain('Insurance Policy.pdf');
        });

        test('should filter by status', () => {
            const statusFilter = container.querySelector('#statusFilter');
            statusFilter.value = 'active';
            statusFilter.dispatchEvent(new Event('change'));

            const documentCards = container.querySelectorAll('.document-card');
            expect(documentCards.length).toBe(2);
        });

        test('should search documents', () => {
            const searchInput = container.querySelector('#documentSearch');
            searchInput.value = 'quote';
            searchInput.dispatchEvent(new Event('input'));

            expect(mockDocumentManager.searchDocuments).toHaveBeenCalledWith('quote');
            const documentCards = container.querySelectorAll('.document-card');
            expect(documentCards.length).toBe(1);
            expect(documentCards[0].textContent).toContain('Quote Request.docx');
        });
    });

    describe('Document Upload', () => {
        test('should show upload modal', () => {
            const uploadButton = container.querySelector('#uploadDocumentBtn');
            uploadButton.click();

            const modal = container.querySelector('#uploadModal');
            expect(modal.classList.contains('active')).toBe(true);
        });

        test('should handle document upload', async () => {
            documentList.showUploadModal();

            // Fill form
            const form = container.querySelector('#uploadForm');
            form.querySelector('#docName').value = 'New Document.pdf';
            form.querySelector('#docType').value = 'policy';
            form.querySelector('#docTags').value = 'new, test';

            // Mock file input
            const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
            const fileInput = form.querySelector('#docFile');
            Object.defineProperty(fileInput, 'files', {
                value: [file]
            });

            // Submit form
            const uploadButton = container.querySelector('#confirmUpload');
            await uploadButton.click();

            expect(mockDocumentManager.addDocument).toHaveBeenCalled();
            expect(container.querySelector('#uploadModal').classList.contains('active')).toBe(false);
        });
    });

    describe('Document Preview', () => {
        test('should show preview modal', () => {
            documentList.showPreviewModal(1);

            const modal = container.querySelector('#previewModal');
            expect(modal.classList.contains('active')).toBe(true);
            expect(modal.textContent).toContain('Insurance Policy.pdf');
        });

        test('should display document information', () => {
            documentList.showPreviewModal(1);

            const infoContainer = container.querySelector('#documentInfo');
            expect(infoContainer.textContent).toContain('Insurance Policy.pdf');
            expect(infoContainer.textContent).toContain('policy');
            expect(infoContainer.textContent).toContain('1MB');
        });
    });

    describe('Document Actions', () => {
        test('should handle document download', () => {
            const downloadButton = container.querySelector('button[onclick^="downloadDocument"]');
            
            // Mock window.alert
            const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
            downloadButton.click();
            
            expect(alertMock).toHaveBeenCalledWith('Download started...');
            alertMock.mockRestore();
        });

        test('should handle document edit', () => {
            const editButton = container.querySelector('button[onclick^="editDocument"]');
            
            // Mock window.alert
            const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
            editButton.click();
            
            expect(alertMock).toHaveBeenCalledWith('Edit functionality coming soon...');
            alertMock.mockRestore();
        });
    });

    describe('Responsive Design', () => {
        test('should adjust layout for mobile view', () => {
            // Mock mobile viewport
            global.innerWidth = 375;
            global.dispatchEvent(new Event('resize'));

            const filters = container.querySelector('.document-filters');
            const computedStyle = window.getComputedStyle(filters);
            
            expect(computedStyle.flexDirection).toBe('column');
        });
    });
});

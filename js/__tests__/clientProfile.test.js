/**
 * @jest-environment jsdom
 */

describe('ClientProfile', () => {
    let clientProfile;
    let container;
    let mockClientManager;

    // Mock client data
    const mockClient = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        category: 'individual',
        status: 'active',
        preferredContact: 'email',
        bestTimeToContact: 'morning',
        newsletterSubscribed: true,
        policyRenewalDate: '2024-06-15',
        lastContactDate: '2023-12-01',
        createdAt: '2023-01-15',
        interactions: [
            {
                id: 1,
                type: 'call',
                notes: 'Initial consultation',
                timestamp: '2023-11-15T10:30:00Z'
            }
        ],
        documents: [
            {
                id: 1,
                name: 'Insurance Policy.pdf',
                type: 'policy',
                uploadedAt: '2023-11-15T11:00:00Z'
            }
        ]
    };

    beforeEach(() => {
        // Create container element
        container = document.createElement('div');
        container.id = 'clientProfileView';
        document.body.appendChild(container);

        // Mock ClientManager
        mockClientManager = {
            getClient: jest.fn().mockReturnValue(mockClient),
            updateClient: jest.fn().mockImplementation((id, updates) => ({
                ...mockClient,
                ...updates
            })),
            addInteraction: jest.fn().mockReturnValue(true),
            addDocument: jest.fn().mockReturnValue(true)
        };

        // Mock window.ClientManager
        window.ClientManager = jest.fn().mockImplementation(() => mockClientManager);

        // Initialize ClientProfile
        clientProfile = new ClientProfile('clientProfileView');
        clientProfile.initialize();
    });

    afterEach(() => {
        document.body.removeChild(container);
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        test('should render empty profile view', () => {
            expect(container.querySelector('.client-profile')).toBeTruthy();
            expect(container.querySelector('.profile-header')).toBeTruthy();
            expect(container.querySelector('#editProfileBtn')).toBeTruthy();
        });

        test('should initialize with ClientManager', () => {
            expect(window.ClientManager).toHaveBeenCalled();
        });
    });

    describe('Client Data Loading', () => {
        beforeEach(() => {
            clientProfile.loadClient(1);
        });

        test('should load and display client basic information', () => {
            expect(container.querySelector('#clientName').textContent).toBe(mockClient.name);
            expect(container.querySelector('#clientEmail').textContent).toBe(mockClient.email);
            expect(container.querySelector('#clientPhone').textContent).toBe(mockClient.phone);
            expect(container.querySelector('#clientCategory').textContent).toBe(mockClient.category);
        });

        test('should display client dates correctly', () => {
            expect(container.querySelector('#nextRenewal').textContent)
                .toContain('June 15, 2024');
            expect(container.querySelector('#lastContact').textContent)
                .toContain('December 1, 2023');
            expect(container.querySelector('#clientSince').textContent)
                .toContain('January 15, 2023');
        });

        test('should display communication preferences', () => {
            expect(container.querySelector('#preferredContact').textContent)
                .toBe(mockClient.preferredContact);
            expect(container.querySelector('#bestTime').textContent)
                .toBe(mockClient.bestTimeToContact);
            expect(container.querySelector('#newsletter').textContent)
                .toBe('Subscribed');
        });
    });

    describe('Edit Functionality', () => {
        beforeEach(() => {
            clientProfile.loadClient(1);
        });

        test('should show edit modal when edit button clicked', () => {
            const editButton = container.querySelector('#editProfileBtn');
            editButton.click();

            const modal = document.querySelector('#editProfileModal');
            expect(modal.classList.contains('active')).toBe(true);
        });

        test('should close edit modal when close button clicked', () => {
            clientProfile.showEditModal();
            
            const closeButton = document.querySelector('#closeEditModal');
            closeButton.click();

            const modal = document.querySelector('#editProfileModal');
            expect(modal.classList.contains('active')).toBe(false);
        });

        test('should update client data when save button clicked', () => {
            clientProfile.showEditModal();

            // Simulate form filling
            const form = document.querySelector('#editProfileForm');
            const nameInput = form.querySelector('input[name="name"]');
            nameInput.value = 'John Updated';

            // Submit form
            const saveButton = document.querySelector('#saveProfile');
            saveButton.click();

            expect(mockClientManager.updateClient).toHaveBeenCalledWith(
                mockClient.id,
                expect.objectContaining({ name: 'John Updated' })
            );
        });
    });

    describe('Interactions and Documents', () => {
        beforeEach(() => {
            clientProfile.loadClient(1);
        });

        test('should display client interactions', () => {
            const timeline = container.querySelector('#notesTimeline');
            const interactions = timeline.querySelectorAll('.note-item');
            
            expect(interactions).toHaveLength(mockClient.interactions.length);
            expect(interactions[0].textContent).toContain('Initial consultation');
        });

        test('should display client documents', () => {
            const documentsGrid = container.querySelector('#documentsGrid');
            const documents = documentsGrid.querySelectorAll('.document-item');
            
            expect(documents).toHaveLength(mockClient.documents.length);
            expect(documents[0].textContent).toContain('Insurance Policy.pdf');
        });

        test('should add new interaction when add note button clicked', () => {
            const addNoteBtn = container.querySelector('#addNoteBtn');
            addNoteBtn.click();

            // Simulate adding a note
            const noteInput = document.querySelector('#noteInput');
            noteInput.value = 'Follow-up call scheduled';
            
            const saveNoteBtn = document.querySelector('#saveNoteBtn');
            saveNoteBtn.click();

            expect(mockClientManager.addInteraction).toHaveBeenCalledWith(
                mockClient.id,
                expect.objectContaining({
                    type: 'note',
                    notes: 'Follow-up call scheduled'
                })
            );
        });
    });

    describe('Status Updates', () => {
        beforeEach(() => {
            clientProfile.loadClient(1);
        });

        test('should display correct status indicator', () => {
            const statusIndicator = container.querySelector('.status-indicator');
            const statusText = container.querySelector('.status-text');

            expect(statusIndicator.classList.contains('active')).toBe(true);
            expect(statusText.textContent.toLowerCase()).toBe('active');
        });

        test('should update status when changed', () => {
            clientProfile.showEditModal();

            // Simulate status change
            const statusSelect = document.querySelector('select[name="status"]');
            statusSelect.value = 'inactive';
            
            const saveButton = document.querySelector('#saveProfile');
            saveButton.click();

            expect(mockClientManager.updateClient).toHaveBeenCalledWith(
                mockClient.id,
                expect.objectContaining({ status: 'inactive' })
            );
        });
    });
});

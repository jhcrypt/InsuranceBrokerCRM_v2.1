class DocumentList {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.documentManager = new DocumentManager();
        this.currentView = 'grid'; // or 'list'
        this.filters = {
            type: 'all',
            status: 'active',
            search: ''
        };
    }

    initialize() {
        this.render();
        this.attachEventListeners();
        this.loadDocuments();
    }

    render() {
        this.container.innerHTML = `
            <div class="document-manager">
                <!-- Header with actions -->
                <div class="document-header">
                    <div class="header-left">
                        <h2>Documents</h2>
                        <div class="view-toggle">
                            <button class="btn-view active" data-view="grid">
                                <i class="fas fa-th-large"></i>
                            </button>
                            <button class="btn-view" data-view="list">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                    </div>
                    <div class="header-right">
                        <button class="btn-upload" id="uploadDocumentBtn">
                            <i class="fas fa-upload"></i> Upload Document
                        </button>
                    </div>
                </div>

                <!-- Filters and Search -->
                <div class="document-filters">
                    <div class="filter-group">
                        <select id="typeFilter" class="filter-select">
                            <option value="all">All Types</option>
                            <option value="policy">Policies</option>
                            <option value="quote">Quotes</option>
                            <option value="claim">Claims</option>
                            <option value="form">Forms</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <select id="statusFilter" class="filter-select">
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                            <option value="all">All Status</option>
                        </select>
                    </div>
                    <div class="search-group">
                        <input type="text" id="documentSearch" 
                               placeholder="Search documents..." 
                               class="search-input">
                    </div>
                </div>

                <!-- Document Grid/List Container -->
                <div class="document-container" id="documentContainer">
                    <!-- Documents will be dynamically added here -->
                </div>

                <!-- Upload Modal -->
                <div class="modal" id="uploadModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Upload Document</h3>
                            <button class="btn-close" id="closeUploadModal">×</button>
                        </div>
                        <div class="modal-body">
                            <form id="uploadForm">
                                <div class="form-group">
                                    <label for="docName">Document Name</label>
                                    <input type="text" id="docName" required>
                                </div>
                                <div class="form-group">
                                    <label for="docType">Document Type</label>
                                    <select id="docType" required>
                                        <option value="policy">Policy</option>
                                        <option value="quote">Quote</option>
                                        <option value="claim">Claim</option>
                                        <option value="form">Form</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="docTags">Tags (comma-separated)</label>
                                    <input type="text" id="docTags">
                                </div>
                                <div class="form-group">
                                    <label for="docFile">File</label>
                                    <input type="file" id="docFile" required>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" id="cancelUpload">Cancel</button>
                            <button class="btn-primary" id="confirmUpload">Upload</button>
                        </div>
                    </div>
                </div>

                <!-- Document Preview Modal -->
                <div class="modal" id="previewModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Document Preview</h3>
                            <button class="btn-close" id="closePreviewModal">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="preview-container" id="previewContainer">
                                <!-- Preview content will be added here -->
                            </div>
                            <div class="document-info" id="documentInfo">
                                <!-- Document information will be added here -->
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" id="downloadDocument">
                                <i class="fas fa-download"></i> Download
                            </button>
                            <button class="btn-primary" id="editDocument">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // View toggle
        const viewButtons = this.container.querySelectorAll('.btn-view');
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                viewButtons.forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                this.currentView = button.dataset.view;
                this.loadDocuments();
            });
        });

        // Filters
        this.container.querySelector('#typeFilter').addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.loadDocuments();
        });

        this.container.querySelector('#statusFilter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.loadDocuments();
        });

        // Search
        this.container.querySelector('#documentSearch').addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.loadDocuments();
        });

        // Upload button
        this.container.querySelector('#uploadDocumentBtn').addEventListener('click', () => {
            this.showUploadModal();
        });

        // Upload modal
        this.container.querySelector('#closeUploadModal').addEventListener('click', () => {
            this.hideUploadModal();
        });

        this.container.querySelector('#cancelUpload').addEventListener('click', () => {
            this.hideUploadModal();
        });

        this.container.querySelector('#confirmUpload').addEventListener('click', () => {
            this.handleDocumentUpload();
        });

        // Preview modal
        this.container.querySelector('#closePreviewModal').addEventListener('click', () => {
            this.hidePreviewModal();
        });

        this.container.querySelector('#downloadDocument').addEventListener('click', () => {
            this.handleDocumentDownload();
        });

        this.container.querySelector('#editDocument').addEventListener('click', () => {
            this.handleDocumentEdit();
        });
    }

    loadDocuments() {
        let documents = this.documentManager.documents;

        // Apply filters
        if (this.filters.type !== 'all') {
            documents = documents.filter(doc => doc.type === this.filters.type);
        }

        if (this.filters.status !== 'all') {
            documents = documents.filter(doc => doc.status === this.filters.status);
        }

        if (this.filters.search) {
            documents = this.documentManager.searchDocuments(this.filters.search);
        }

        // Render documents
        const container = this.container.querySelector('#documentContainer');
        container.className = `document-container ${this.currentView}-view`;

        if (this.currentView === 'grid') {
            this.renderGridView(container, documents);
        } else {
            this.renderListView(container, documents);
        }
    }

    renderGridView(container, documents) {
        container.innerHTML = documents.map(doc => `
            <div class="document-card" data-id="${doc.id}">
                <div class="document-icon">
                    <i class="far ${this.getDocumentIcon(doc.type)}"></i>
                </div>
                <div class="document-info">
                    <h4>${doc.name}</h4>
                    <p class="document-type">${doc.type}</p>
                    <p class="document-date">
                        Updated ${this.formatDate(doc.updatedAt || doc.uploadedAt)}
                    </p>
                </div>
                <div class="document-actions">
                    <button class="btn-icon" onclick="previewDocument(${doc.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="downloadDocument(${doc.id})">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon" onclick="editDocument(${doc.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderListView(container, documents) {
        container.innerHTML = `
            <table class="document-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Last Updated</th>
                        <th>Size</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${documents.map(doc => `
                        <tr data-id="${doc.id}">
                            <td>
                                <div class="document-name">
                                    <i class="far ${this.getDocumentIcon(doc.type)}"></i>
                                    <span>${doc.name}</span>
                                </div>
                            </td>
                            <td>${doc.type}</td>
                            <td>${this.formatDate(doc.updatedAt || doc.uploadedAt)}</td>
                            <td>${this.formatSize(doc.size)}</td>
                            <td class="actions">
                                <button class="btn-icon" onclick="previewDocument(${doc.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-icon" onclick="downloadDocument(${doc.id})">
                                    <i class="fas fa-download"></i>
                                </button>
                                <button class="btn-icon" onclick="editDocument(${doc.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    getDocumentIcon(type) {
        const icons = {
            policy: 'fa-file-contract',
            quote: 'fa-file-invoice-dollar',
            claim: 'fa-file-medical',
            form: 'fa-file-alt',
            default: 'fa-file'
        };
        return icons[type] || icons.default;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatSize(bytes) {
        if (!bytes) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    }

    showUploadModal() {
        const modal = this.container.querySelector('#uploadModal');
        modal.classList.add('active');
    }

    hideUploadModal() {
        const modal = this.container.querySelector('#uploadModal');
        modal.classList.remove('active');
        this.container.querySelector('#uploadForm').reset();
    }

    async handleDocumentUpload() {
        const form = this.container.querySelector('#uploadForm');
        const fileInput = form.querySelector('#docFile');
        const file = fileInput.files[0];

        if (!file) {
            alert('Please select a file to upload');
            return;
        }

        try {
            // In a real implementation, you would upload the file to a server
            // For now, we'll create a mock document
            const document = {
                name: form.querySelector('#docName').value || file.name,
                type: form.querySelector('#docType').value,
                size: file.size,
                mimeType: file.type,
                tags: form.querySelector('#docTags').value
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag),
                url: URL.createObjectURL(file) // In real implementation, this would be server URL
            };

            this.documentManager.addDocument(1, document); // Using dummy clientId 1
            this.hideUploadModal();
            this.loadDocuments();
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Error uploading document. Please try again.');
        }
    }

    showPreviewModal(docId) {
        const doc = this.documentManager.getDocument(docId);
        if (!doc) return;

        const modal = this.container.querySelector('#previewModal');
        const previewContainer = modal.querySelector('#previewContainer');
        const infoContainer = modal.querySelector('#documentInfo');

        // In a real implementation, you would load the actual document preview
        previewContainer.innerHTML = `
            <div class="preview-placeholder">
                <i class="far ${this.getDocumentIcon(doc.type)} fa-3x"></i>
                <p>Preview not available</p>
            </div>
        `;

        infoContainer.innerHTML = `
            <h4>${doc.name}</h4>
            <p><strong>Type:</strong> ${doc.type}</p>
            <p><strong>Size:</strong> ${this.formatSize(doc.size)}</p>
            <p><strong>Uploaded:</strong> ${this.formatDate(doc.uploadedAt)}</p>
            ${doc.tags ? `<p><strong>Tags:</strong> ${doc.tags.join(', ')}</p>` : ''}
            <p><strong>Version:</strong> ${doc.versions.length}</p>
        `;

        modal.classList.add('active');
    }

    hidePreviewModal() {
        const modal = this.container.querySelector('#previewModal');
        modal.classList.remove('active');
    }

    handleDocumentDownload() {
        // In a real implementation, you would trigger the actual file download
        alert('Download started...');
    }

    handleDocumentEdit() {
        // Implementation for document editing will be added later
        alert('Edit functionality coming soon...');
    }
}

// Export the DocumentList class
window.DocumentList = DocumentList;

// Global functions for document actions
window.previewDocument = function(docId) {
    const documentList = new DocumentList('documentListView');
    documentList.showPreviewModal(docId);
};

window.downloadDocument = function(docId) {
    const documentList = new DocumentList('documentListView');
    documentList.handleDocumentDownload(docId);
};

window.editDocument = function(docId) {
    const documentList = new DocumentList('documentListView');
    documentList.handleDocumentEdit(docId);
};

class DocumentManager {
    constructor() {
        this.documents = [];
        this.loadDocuments();
    }

    // Load documents from storage
    loadDocuments() {
        const savedDocs = localStorage.getItem('documents');
        if (savedDocs) {
            this.documents = JSON.parse(savedDocs);
        }
    }

    // Save documents to storage
    saveDocuments() {
        localStorage.setItem('documents', JSON.stringify(this.documents));
    }

    // Add new document
    addDocument(clientId, document) {
        const newDoc = {
            id: Date.now(),
            clientId,
            uploadedAt: new Date().toISOString(),
            status: 'active',
            versions: [{
                number: 1,
                timestamp: new Date().toISOString(),
                ...document
            }],
            ...document
        };

        this.documents.push(newDoc);
        this.saveDocuments();
        return newDoc;
    }

    // Get document by ID
    getDocument(docId) {
        return this.documents.find(doc => doc.id === docId);
    }

    // Get all documents for a client
    getClientDocuments(clientId) {
        return this.documents.filter(doc => doc.clientId === clientId);
    }

    // Add new version of existing document
    addDocumentVersion(docId, newVersion) {
        const doc = this.getDocument(docId);
        if (doc) {
            const versionNumber = doc.versions.length + 1;
            const version = {
                number: versionNumber,
                timestamp: new Date().toISOString(),
                ...newVersion
            };
            
            doc.versions.push(version);
            doc.currentVersion = versionNumber;
            doc.name = newVersion.name || doc.name;
            doc.type = newVersion.type || doc.type;
            doc.updatedAt = new Date().toISOString();
            
            this.saveDocuments();
            return version;
        }
        return null;
    }

    // Get specific version of a document
    getDocumentVersion(docId, versionNumber) {
        const doc = this.getDocument(docId);
        if (doc) {
            return doc.versions.find(v => v.number === versionNumber);
        }
        return null;
    }

    // Update document metadata
    updateDocument(docId, updates) {
        const doc = this.getDocument(docId);
        if (doc) {
            Object.assign(doc, {
                ...updates,
                updatedAt: new Date().toISOString()
            });
            this.saveDocuments();
            return doc;
        }
        return null;
    }

    // Archive document
    archiveDocument(docId) {
        const doc = this.getDocument(docId);
        if (doc) {
            doc.status = 'archived';
            doc.archivedAt = new Date().toISOString();
            this.saveDocuments();
            return true;
        }
        return false;
    }

    // Delete document (soft delete)
    deleteDocument(docId) {
        const doc = this.getDocument(docId);
        if (doc) {
            doc.status = 'deleted';
            doc.deletedAt = new Date().toISOString();
            this.saveDocuments();
            return true;
        }
        return false;
    }

    // Search documents
    searchDocuments(query) {
        query = query.toLowerCase();
        return this.documents.filter(doc => 
            doc.status === 'active' && (
                doc.name.toLowerCase().includes(query) ||
                doc.type.toLowerCase().includes(query) ||
                doc.tags?.some(tag => tag.toLowerCase().includes(query))
            )
        );
    }

    // Get documents by type
    getDocumentsByType(type) {
        return this.documents.filter(doc => 
            doc.status === 'active' && doc.type === type
        );
    }

    // Get recent documents
    getRecentDocuments(limit = 10) {
        return this.documents
            .filter(doc => doc.status === 'active')
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
            .slice(0, limit);
    }

    // Add tag to document
    addDocumentTag(docId, tag) {
        const doc = this.getDocument(docId);
        if (doc) {
            if (!doc.tags) {
                doc.tags = [];
            }
            if (!doc.tags.includes(tag)) {
                doc.tags.push(tag);
                this.saveDocuments();
            }
            return true;
        }
        return false;
    }

    // Remove tag from document
    removeDocumentTag(docId, tag) {
        const doc = this.getDocument(docId);
        if (doc && doc.tags) {
            const index = doc.tags.indexOf(tag);
            if (index !== -1) {
                doc.tags.splice(index, 1);
                this.saveDocuments();
                return true;
            }
        }
        return false;
    }

    // Get document statistics
    getDocumentStats() {
        const stats = {
            total: 0,
            byType: {},
            byStatus: {
                active: 0,
                archived: 0,
                deleted: 0
            },
            recentUploads: 0
        };

        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

        this.documents.forEach(doc => {
            // Total count
            stats.total++;

            // Count by type
            stats.byType[doc.type] = (stats.byType[doc.type] || 0) + 1;

            // Count by status
            stats.byStatus[doc.status]++;

            // Count recent uploads
            if (new Date(doc.uploadedAt) >= thirtyDaysAgo) {
                stats.recentUploads++;
            }
        });

        return stats;
    }
}

// Export the DocumentManager class
window.DocumentManager = DocumentManager;

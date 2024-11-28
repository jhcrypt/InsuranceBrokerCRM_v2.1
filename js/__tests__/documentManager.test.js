describe('DocumentManager', () => {
    let documentManager;
    const clientId = 1;

    // Mock document data
    const mockDocument = {
        name: 'Insurance Policy.pdf',
        type: 'policy',
        size: 1024,
        mimeType: 'application/pdf',
        url: 'documents/policy123.pdf',
        tags: ['policy', 'auto']
    };

    beforeEach(() => {
        // Clear localStorage mock before each test
        localStorage.clear();
        localStorage.getItem.mockReturnValue(null);
        
        // Create new instance of DocumentManager
        documentManager = new DocumentManager();
    });

    describe('Document Management', () => {
        test('should add a new document', () => {
            const doc = documentManager.addDocument(clientId, mockDocument);
            
            expect(doc).toHaveProperty('id');
            expect(doc.name).toBe(mockDocument.name);
            expect(doc.type).toBe(mockDocument.type);
            expect(doc.clientId).toBe(clientId);
            expect(doc.status).toBe('active');
            expect(doc.versions).toHaveLength(1);
            expect(localStorage.setItem).toHaveBeenCalled();
        });

        test('should retrieve document by ID', () => {
            const doc = documentManager.addDocument(clientId, mockDocument);
            const retrieved = documentManager.getDocument(doc.id);
            
            expect(retrieved).toBeTruthy();
            expect(retrieved.id).toBe(doc.id);
            expect(retrieved.name).toBe(doc.name);
        });

        test('should get all documents for a client', () => {
            documentManager.addDocument(clientId, mockDocument);
            documentManager.addDocument(clientId, {
                ...mockDocument,
                name: 'Quote.pdf',
                type: 'quote'
            });

            const clientDocs = documentManager.getClientDocuments(clientId);
            expect(clientDocs).toHaveLength(2);
            expect(clientDocs[0].clientId).toBe(clientId);
            expect(clientDocs[1].clientId).toBe(clientId);
        });
    });

    describe('Version Control', () => {
        test('should add new version to existing document', () => {
            const doc = documentManager.addDocument(clientId, mockDocument);
            const newVersion = {
                name: 'Insurance Policy v2.pdf',
                size: 1048,
                url: 'documents/policy123_v2.pdf'
            };

            const version = documentManager.addDocumentVersion(doc.id, newVersion);
            const updatedDoc = documentManager.getDocument(doc.id);
            
            expect(version.number).toBe(2);
            expect(updatedDoc.versions).toHaveLength(2);
            expect(updatedDoc.currentVersion).toBe(2);
            expect(updatedDoc.name).toBe(newVersion.name);
        });

        test('should retrieve specific version of document', () => {
            const doc = documentManager.addDocument(clientId, mockDocument);
            const newVersion = {
                name: 'Insurance Policy v2.pdf',
                size: 1048,
                url: 'documents/policy123_v2.pdf'
            };
            documentManager.addDocumentVersion(doc.id, newVersion);

            const version1 = documentManager.getDocumentVersion(doc.id, 1);
            const version2 = documentManager.getDocumentVersion(doc.id, 2);
            
            expect(version1.name).toBe(mockDocument.name);
            expect(version2.name).toBe(newVersion.name);
        });
    });

    describe('Document Status Management', () => {
        test('should archive document', () => {
            const doc = documentManager.addDocument(clientId, mockDocument);
            const success = documentManager.archiveDocument(doc.id);
            const archivedDoc = documentManager.getDocument(doc.id);
            
            expect(success).toBe(true);
            expect(archivedDoc.status).toBe('archived');
            expect(archivedDoc.archivedAt).toBeDefined();
        });

        test('should soft delete document', () => {
            const doc = documentManager.addDocument(clientId, mockDocument);
            const success = documentManager.deleteDocument(doc.id);
            const deletedDoc = documentManager.getDocument(doc.id);
            
            expect(success).toBe(true);
            expect(deletedDoc.status).toBe('deleted');
            expect(deletedDoc.deletedAt).toBeDefined();
        });
    });

    describe('Document Search and Filtering', () => {
        beforeEach(() => {
            documentManager.addDocument(clientId, mockDocument);
            documentManager.addDocument(clientId, {
                name: 'Auto Quote.pdf',
                type: 'quote',
                tags: ['quote', 'auto']
            });
            documentManager.addDocument(clientId, {
                name: 'Home Insurance.pdf',
                type: 'policy',
                tags: ['policy', 'home']
            });
        });

        test('should search documents by name', () => {
            const results = documentManager.searchDocuments('quote');
            expect(results).toHaveLength(1);
            expect(results[0].name).toBe('Auto Quote.pdf');
        });

        test('should search documents by type', () => {
            const policies = documentManager.getDocumentsByType('policy');
            expect(policies).toHaveLength(2);
        });

        test('should search documents by tag', () => {
            const results = documentManager.searchDocuments('auto');
            expect(results).toHaveLength(2);
        });
    });

    describe('Document Tags', () => {
        test('should add tag to document', () => {
            const doc = documentManager.addDocument(clientId, mockDocument);
            const success = documentManager.addDocumentTag(doc.id, 'important');
            const updatedDoc = documentManager.getDocument(doc.id);
            
            expect(success).toBe(true);
            expect(updatedDoc.tags).toContain('important');
        });

        test('should not add duplicate tag', () => {
            const doc = documentManager.addDocument(clientId, mockDocument);
            documentManager.addDocumentTag(doc.id, 'important');
            documentManager.addDocumentTag(doc.id, 'important');
            
            const updatedDoc = documentManager.getDocument(doc.id);
            expect(updatedDoc.tags.filter(tag => tag === 'important')).toHaveLength(1);
        });

        test('should remove tag from document', () => {
            const doc = documentManager.addDocument(clientId, mockDocument);
            documentManager.addDocumentTag(doc.id, 'important');
            const success = documentManager.removeDocumentTag(doc.id, 'important');
            const updatedDoc = documentManager.getDocument(doc.id);
            
            expect(success).toBe(true);
            expect(updatedDoc.tags).not.toContain('important');
        });
    });

    describe('Document Statistics', () => {
        beforeEach(() => {
            documentManager.addDocument(clientId, mockDocument);
            documentManager.addDocument(clientId, {
                name: 'Auto Quote.pdf',
                type: 'quote',
                tags: ['quote', 'auto']
            });
            const doc3 = documentManager.addDocument(clientId, {
                name: 'Home Insurance.pdf',
                type: 'policy',
                tags: ['policy', 'home']
            });
            documentManager.archiveDocument(doc3.id);
        });

        test('should generate correct document statistics', () => {
            const stats = documentManager.getDocumentStats();
            
            expect(stats.total).toBe(3);
            expect(stats.byType.policy).toBe(2);
            expect(stats.byType.quote).toBe(1);
            expect(stats.byStatus.active).toBe(2);
            expect(stats.byStatus.archived).toBe(1);
            expect(stats.recentUploads).toBe(3);
        });
    });
});

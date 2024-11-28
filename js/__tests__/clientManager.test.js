describe('ClientManager', () => {
    let clientManager;
    let mockLocalStorage;

    // Mock client data
    const mockClient = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        category: 'individual',
        status: 'prospect'
    };

    beforeEach(() => {
        // Clear localStorage mock before each test
        localStorage.clear();
        localStorage.getItem.mockReturnValue(null);
        
        // Create new instance of ClientManager
        clientManager = new ClientManager();
    });

    describe('Client Management', () => {
        test('should add a new client', () => {
            const client = clientManager.addClient(mockClient);
            
            expect(client).toHaveProperty('id');
            expect(client.name).toBe(mockClient.name);
            expect(client.email).toBe(mockClient.email);
            expect(client.status).toBe('prospect');
            expect(client.createdAt).toBeDefined();
            expect(localStorage.setItem).toHaveBeenCalled();
        });

        test('should update existing client', () => {
            const client = clientManager.addClient(mockClient);
            const updates = {
                name: 'John Updated',
                status: 'active'
            };

            const updatedClient = clientManager.updateClient(client.id, updates);
            
            expect(updatedClient.name).toBe(updates.name);
            expect(updatedClient.status).toBe(updates.status);
            expect(updatedClient.email).toBe(mockClient.email);
            expect(updatedClient.updatedAt).toBeDefined();
        });

        test('should add interaction to client', () => {
            const client = clientManager.addClient(mockClient);
            const interaction = {
                type: 'call',
                notes: 'Discussed auto insurance options'
            };

            const success = clientManager.addInteraction(client.id, interaction);
            const updatedClient = clientManager.getClient(client.id);
            
            expect(success).toBe(true);
            expect(updatedClient.interactions).toHaveLength(1);
            expect(updatedClient.interactions[0].type).toBe(interaction.type);
            expect(updatedClient.interactions[0].notes).toBe(interaction.notes);
            expect(updatedClient.interactions[0].timestamp).toBeDefined();
        });

        test('should add document to client', () => {
            const client = clientManager.addClient(mockClient);
            const document = {
                name: 'Insurance Policy.pdf',
                type: 'policy',
                url: 'documents/policy123.pdf'
            };

            const success = clientManager.addDocument(client.id, document);
            const updatedClient = clientManager.getClient(client.id);
            
            expect(success).toBe(true);
            expect(updatedClient.documents).toHaveLength(1);
            expect(updatedClient.documents[0].name).toBe(document.name);
            expect(updatedClient.documents[0].uploadedAt).toBeDefined();
        });
    });

    describe('Client Search and Filtering', () => {
        beforeEach(() => {
            // Add multiple clients for search testing
            clientManager.addClient(mockClient);
            clientManager.addClient({
                name: 'Jane Smith',
                email: 'jane@example.com',
                phone: '987-654-3210',
                category: 'business',
                status: 'active'
            });
            clientManager.addClient({
                name: 'Bob Johnson',
                email: 'bob@example.com',
                phone: '555-555-5555',
                category: 'individual',
                status: 'active'
            });
        });

        test('should search clients by name', () => {
            const results = clientManager.searchClients('John');
            expect(results).toHaveLength(1);
            expect(results[0].name).toBe('John Doe');
        });

        test('should search clients by email', () => {
            const results = clientManager.searchClients('jane@example');
            expect(results).toHaveLength(1);
            expect(results[0].name).toBe('Jane Smith');
        });

        test('should filter clients by status', () => {
            const activeClients = clientManager.getClientsByStatus('active');
            expect(activeClients).toHaveLength(2);
        });

        test('should filter clients by category', () => {
            const individualClients = clientManager.getClientsByCategory('individual');
            expect(individualClients).toHaveLength(2);
        });
    });

    describe('Client Timeline', () => {
        test('should generate client timeline', () => {
            const client = clientManager.addClient(mockClient);
            
            // Add interaction
            clientManager.addInteraction(client.id, {
                type: 'call',
                notes: 'Initial consultation'
            });

            // Add document
            clientManager.addDocument(client.id, {
                name: 'Quote.pdf',
                type: 'quote'
            });

            const timeline = clientManager.getClientTimeline(client.id);
            
            expect(timeline).toHaveLength(3); // Creation + interaction + document
            expect(timeline[0].type).toBe('document');
            expect(timeline[1].type).toBe('interaction');
            expect(timeline[2].type).toBe('creation');
        });
    });

    describe('Renewal Tracking', () => {
        test('should identify upcoming renewals', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 15);

            const client = clientManager.addClient({
                ...mockClient,
                policyRenewalDate: futureDate.toISOString()
            });

            const upcomingRenewals = clientManager.getUpcomingRenewals(30);
            
            expect(upcomingRenewals).toHaveLength(1);
            expect(upcomingRenewals[0].id).toBe(client.id);
        });

        test('should not include renewals outside threshold', () => {
            const farFutureDate = new Date();
            farFutureDate.setDate(farFutureDate.getDate() + 45);

            clientManager.addClient({
                ...mockClient,
                policyRenewalDate: farFutureDate.toISOString()
            });

            const upcomingRenewals = clientManager.getUpcomingRenewals(30);
            
            expect(upcomingRenewals).toHaveLength(0);
        });
    });
});

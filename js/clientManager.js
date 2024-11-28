// Client Management System

class ClientManager {
    constructor() {
        this.clients = [];
        this.loadClients();
    }

    // Load clients from localStorage or server
    loadClients() {
        const savedClients = localStorage.getItem('clients');
        if (savedClients) {
            this.clients = JSON.parse(savedClients);
        }
    }

    // Save clients to localStorage or server
    saveClients() {
        localStorage.setItem('clients', JSON.stringify(this.clients));
    }

    // Add new client
    addClient(clientData) {
        const client = {
            id: Date.now(),
            createdAt: new Date().toISOString(),
            status: 'prospect',
            interactions: [],
            documents: [],
            ...clientData
        };
        this.clients.push(client);
        this.saveClients();
        return client;
    }

    // Delete client
    deleteClient(clientId) {
        const index = this.clients.findIndex(c => c.id === clientId);
        if (index !== -1) {
            this.clients.splice(index, 1);
            this.saveClients();
            return true;
        }
        return false;
    }

    // Update client information
    updateClient(clientId, updates) {
        const index = this.clients.findIndex(c => c.id === clientId);
        if (index !== -1) {
            this.clients[index] = {
                ...this.clients[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveClients();
            return this.clients[index];
        }
        return null;
    }

    // Add client interaction
    addInteraction(clientId, interaction) {
        const client = this.clients.find(c => c.id === clientId);
        if (client) {
            if (!client.interactions) {
                client.interactions = [];
            }
            client.interactions.push({
                id: Date.now(),
                timestamp: new Date().toISOString(),
                ...interaction
            });
            this.saveClients();
            return true;
        }
        return false;
    }

    // Add document reference
    addDocument(clientId, document) {
        const client = this.clients.find(c => c.id === clientId);
        if (client) {
            if (!client.documents) {
                client.documents = [];
            }
            client.documents.push({
                id: Date.now(),
                uploadedAt: new Date().toISOString(),
                ...document
            });
            this.saveClients();
            return true;
        }
        return false;
    }

    // Get client by ID
    getClient(clientId) {
        return this.clients.find(c => c.id === clientId);
    }

    // Get clients by status
    getClientsByStatus(status) {
        return this.clients.filter(c => c.status === status);
    }

    // Get clients by category
    getClientsByCategory(category) {
        return this.clients.filter(c => c.category === category);
    }

    // Search clients
    searchClients(query) {
        query = query.toLowerCase();
        return this.clients.filter(client => 
            client.name?.toLowerCase().includes(query) ||
            client.email?.toLowerCase().includes(query) ||
            client.phone?.includes(query) ||
            client.notes?.toLowerCase().includes(query)
        );
    }

    // Update client status
    updateClientStatus(clientId, newStatus) {
        const client = this.clients.find(c => c.id === clientId);
        if (client) {
            client.status = newStatus;
            client.statusUpdatedAt = new Date().toISOString();
            this.saveClients();
            return true;
        }
        return false;
    }

    // Get upcoming renewals
    getUpcomingRenewals(daysThreshold = 30) {
        const now = new Date();
        const threshold = new Date();
        threshold.setDate(threshold.getDate() + daysThreshold);

        return this.clients.filter(client => {
            if (!client.policyRenewalDate) return false;
            const renewalDate = new Date(client.policyRenewalDate);
            return renewalDate >= now && renewalDate <= threshold;
        });
    }

    // Get client timeline
    getClientTimeline(clientId) {
        const client = this.getClient(clientId);
        if (!client) return [];

        const timeline = [
            // Add creation event
            {
                type: 'creation',
                timestamp: client.createdAt,
                title: 'Client Added',
                description: 'Client profile was created'
            }
        ];

        // Add interactions to timeline
        if (client.interactions) {
            timeline.push(...client.interactions.map(interaction => ({
                type: 'interaction',
                timestamp: interaction.timestamp,
                title: interaction.type,
                description: interaction.notes
            })));
        }

        // Add document events to timeline
        if (client.documents) {
            timeline.push(...client.documents.map(doc => ({
                type: 'document',
                timestamp: doc.uploadedAt,
                title: 'Document Added',
                description: doc.name
            })));
        }

        // Sort timeline by date
        return timeline.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
    }
}

// Export the ClientManager class
window.ClientManager = ClientManager;

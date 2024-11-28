class ClientList {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.clientManager = new ClientManager();
    }

    initialize() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        if (!this.container) return;

        const headerHtml = `
            <div class="list-header">
                <h2>Client Management</h2>
                <button class="btn-add-client">
                    <i class="fas fa-plus"></i>
                    Add Client
                </button>
            </div>
            <div class="list-filters">
                <div class="filter-group">
                    <select class="filter-select" id="statusFilter">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="prospect">Prospect</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div class="filter-group">
                    <select class="filter-select" id="categoryFilter">
                        <option value="">All Categories</option>
                        <option value="individual">Individual</option>
                        <option value="business">Business</option>
                        <option value="family">Family</option>
                    </select>
                </div>
                <div class="search-group">
                    <input type="text" class="search-input" placeholder="Search clients..." id="searchInput">
                </div>
            </div>
        `;

        const clients = this.clientManager.getClients();
        const clientsHtml = this.renderClients(clients);

        this.container.innerHTML = `
            ${headerHtml}
            <div class="client-grid">
                ${clientsHtml}
            </div>
        `;
    }

    renderClients(clients) {
        return clients.map(client => `
            <div class="client-card">
                <div class="client-info">
                    <h3>${client.name}</h3>
                    <span class="client-category">${client.category}</span>
                    <span class="status-badge ${client.status.toLowerCase()}">${client.status}</span>
                </div>
                <div class="client-contact">
                    <p><i class="fas fa-envelope"></i>${client.email || 'No email'}</p>
                    <p><i class="fas fa-phone"></i>${client.phone || 'No phone'}</p>
                    <p><i class="fas fa-map-marker-alt"></i>${client.address || 'No address'}</p>
                </div>
                <div class="client-metrics">
                    <div class="metric">
                        <span class="metric-value">${client.policies || 0}</span>
                        <span class="metric-label">Policies</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${client.quotes || 0}</span>
                        <span class="metric-label">Quotes</span>
                    </div>
                </div>
                <div class="client-card-footer">
                    <button class="btn-icon view-btn" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-btn" title="Edit Client">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon contact-btn" title="Contact Client">
                        <i class="fas fa-comment"></i>
                    </button>
                    <button class="btn-icon delete-btn" title="Delete Client">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    attachEventListeners() {
        // Add Client button
        const addClientBtn = this.container.querySelector('.btn-add-client');
        if (addClientBtn) {
            addClientBtn.addEventListener('click', () => {
                const modal = new AddClientModal();
                modal.showModal();
            });
        }

        // Status filter
        const statusFilter = this.container.querySelector('#statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }

        // Category filter
        const categoryFilter = this.container.querySelector('#categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.applyFilters());
        }

        // Search input
        const searchInput = this.container.querySelector('#searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.applyFilters());
        }

        // Client card buttons
        this.container.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-icon');
            if (!button) return;

            const clientCard = button.closest('.client-card');
            if (!clientCard) return;

            if (button.classList.contains('view-btn')) {
                // Handle view client
                console.log('View client');
            } else if (button.classList.contains('edit-btn')) {
                // Handle edit client
                console.log('Edit client');
            } else if (button.classList.contains('contact-btn')) {
                // Handle contact client
                console.log('Contact client');
            } else if (button.classList.contains('delete-btn')) {
                // Handle delete client
                console.log('Delete client');
            }
        });
    }

    applyFilters() {
        const statusFilter = document.getElementById('statusFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const searchInput = document.getElementById('searchInput');

        const status = statusFilter ? statusFilter.value : '';
        const category = categoryFilter ? categoryFilter.value : '';
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        let filteredClients = this.clientManager.getClients();

        if (status) {
            filteredClients = filteredClients.filter(client => 
                client.status.toLowerCase() === status.toLowerCase()
            );
        }

        if (category) {
            filteredClients = filteredClients.filter(client => 
                client.category.toLowerCase() === category.toLowerCase()
            );
        }

        if (searchTerm) {
            filteredClients = filteredClients.filter(client => 
                client.name.toLowerCase().includes(searchTerm) ||
                client.email.toLowerCase().includes(searchTerm) ||
                client.phone.toLowerCase().includes(searchTerm)
            );
        }

        const clientGrid = this.container.querySelector('.client-grid');
        if (clientGrid) {
            clientGrid.innerHTML = this.renderClients(filteredClients);
        }
    }
}

// Export the ClientList class
window.ClientList = ClientList;

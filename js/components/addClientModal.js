class AddClientModal {
    static instance = null;

    constructor() {
        // Singleton pattern - ensure only one modal instance exists
        if (AddClientModal.instance) {
            return AddClientModal.instance;
        }
        AddClientModal.instance = this;
        
        this.clientManager = new ClientManager();
        this.modal = null;
    }

    createModal() {
        // Remove any existing modals first
        this.removeExistingModals();

        const modalHtml = `
            <div class="modal" id="addClientModal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add New Client</h3>
                        <button class="btn-close" id="closeAddClientModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="addClientForm">
                            <div class="form-section">
                                <h4>Basic Information</h4>
                                <div class="form-group">
                                    <label for="clientName">Full Name*</label>
                                    <input type="text" id="clientName" name="name" required>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="clientEmail">Email</label>
                                        <input type="email" id="clientEmail" name="email">
                                    </div>
                                    <div class="form-group">
                                        <label for="clientPhone">Phone</label>
                                        <input type="tel" id="clientPhone" name="phone">
                                    </div>
                                </div>
                            </div>

                            <div class="form-section">
                                <h4>Client Details</h4>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="clientType">Client Type</label>
                                        <select id="clientType" name="category">
                                            <option value="individual">Individual</option>
                                            <option value="business">Business</option>
                                            <option value="family">Family</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="clientStatus">Status</label>
                                        <select id="clientStatus" name="status">
                                            <option value="prospect">Prospect</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="form-section">
                                <h4>Address</h4>
                                <div class="form-group">
                                    <label for="clientAddress">Street Address</label>
                                    <input type="text" id="clientAddress" name="address">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" id="cancelAddClient">Cancel</button>
                        <button type="button" class="btn-primary" id="saveClient">Add Client</button>
                    </div>
                </div>
            </div>
        `;

        // Create modal element
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        this.modal = modalContainer.firstElementChild;
        document.body.appendChild(this.modal);

        // Attach event listeners
        this.attachEventListeners();
    }

    removeExistingModals() {
        // Remove any existing modals
        const existingModals = document.querySelectorAll('.modal');
        existingModals.forEach(modal => {
            modal.remove();
        });
    }

    attachEventListeners() {
        if (!this.modal) return;

        // Close button
        const closeBtn = this.modal.querySelector('#closeAddClientModal');
        closeBtn?.addEventListener('click', () => this.hideModal());

        // Cancel button
        const cancelBtn = this.modal.querySelector('#cancelAddClient');
        cancelBtn?.addEventListener('click', () => this.hideModal());

        // Save button
        const saveBtn = this.modal.querySelector('#saveClient');
        saveBtn?.addEventListener('click', () => this.saveClient());

        // Close on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });
    }

    showModal() {
        if (!this.modal) {
            this.createModal();
        }
        this.modal.style.display = 'flex';
        const form = this.modal.querySelector('#addClientForm');
        if (form) {
            form.reset();
        }
    }

    hideModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            const form = this.modal.querySelector('#addClientForm');
            if (form) {
                form.reset();
            }
            // Remove the modal from DOM after hiding
            this.modal.remove();
            this.modal = null;
        }
    }

    saveClient() {
        const form = document.getElementById('addClientForm');
        if (!form) return;

        const formData = new FormData(form);
        const clientData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            category: formData.get('category'),
            status: formData.get('status'),
            address: formData.get('address')
        };

        try {
            this.clientManager.addClient(clientData);
            this.hideModal();
            
            // Refresh client list
            const clientList = new ClientList('clientListView');
            clientList.loadClients();

            // Show success message
            this.showNotification('Client added successfully', 'success');
        } catch (error) {
            console.error('Error adding client:', error);
            this.showNotification('Error adding client', 'error');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Export the AddClientModal class
window.AddClientModal = AddClientModal;

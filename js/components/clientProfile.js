class ClientProfile {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.clientManager = new ClientManager();
        this.currentClient = null;
    }

    // Initialize the profile view
    initialize() {
        this.render();
        this.attachEventListeners();
    }

    // Render the client profile interface
    render() {
        this.container.innerHTML = `
            <div class="client-profile">
                <div class="profile-header">
                    <div class="header-left">
                        <h2>Client Profile</h2>
                        <div class="client-status">
                            <span class="status-indicator"></span>
                            <span class="status-text"></span>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="btn-edit" id="editProfileBtn">
                            <i class="fas fa-edit"></i> Edit Profile
                        </button>
                    </div>
                </div>

                <div class="profile-content">
                    <!-- Basic Information -->
                    <section class="profile-section">
                        <h3>Basic Information</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Full Name</label>
                                <div class="value" id="clientName"></div>
                            </div>
                            <div class="info-item">
                                <label>Email</label>
                                <div class="value" id="clientEmail"></div>
                            </div>
                            <div class="info-item">
                                <label>Phone</label>
                                <div class="value" id="clientPhone"></div>
                            </div>
                            <div class="info-item">
                                <label>Category</label>
                                <div class="value" id="clientCategory"></div>
                            </div>
                        </div>
                    </section>

                    <!-- Important Dates -->
                    <section class="profile-section">
                        <h3>Important Dates</h3>
                        <div class="dates-grid">
                            <div class="date-item">
                                <label>Next Renewal</label>
                                <div class="value" id="nextRenewal"></div>
                            </div>
                            <div class="date-item">
                                <label>Last Contact</label>
                                <div class="value" id="lastContact"></div>
                            </div>
                            <div class="date-item">
                                <label>Client Since</label>
                                <div class="value" id="clientSince"></div>
                            </div>
                        </div>
                    </section>

                    <!-- Communication Preferences -->
                    <section class="profile-section">
                        <h3>Communication Preferences</h3>
                        <div class="preferences-grid">
                            <div class="preference-item">
                                <label>Preferred Contact Method</label>
                                <div class="value" id="preferredContact"></div>
                            </div>
                            <div class="preference-item">
                                <label>Best Time to Contact</label>
                                <div class="value" id="bestTime"></div>
                            </div>
                            <div class="preference-item">
                                <label>Newsletter Subscription</label>
                                <div class="value" id="newsletter"></div>
                            </div>
                        </div>
                    </section>

                    <!-- Family/Business Relationships -->
                    <section class="profile-section">
                        <h3>Relationships</h3>
                        <div class="relationships-list" id="relationshipsList">
                            <!-- Relationships will be dynamically added here -->
                        </div>
                        <button class="btn-add" id="addRelationshipBtn">
                            <i class="fas fa-plus"></i> Add Relationship
                        </button>
                    </section>

                    <!-- Notes & History -->
                    <section class="profile-section">
                        <h3>Notes & History</h3>
                        <div class="notes-timeline" id="notesTimeline">
                            <!-- Notes and history will be dynamically added here -->
                        </div>
                        <button class="btn-add" id="addNoteBtn">
                            <i class="fas fa-plus"></i> Add Note
                        </button>
                    </section>

                    <!-- Documents -->
                    <section class="profile-section">
                        <h3>Documents</h3>
                        <div class="documents-grid" id="documentsGrid">
                            <!-- Documents will be dynamically added here -->
                        </div>
                        <button class="btn-add" id="uploadDocumentBtn">
                            <i class="fas fa-upload"></i> Upload Document
                        </button>
                    </section>
                </div>
            </div>

            <!-- Edit Profile Modal -->
            <div class="modal" id="editProfileModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit Profile</h3>
                        <button class="btn-close" id="closeEditModal">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="editProfileForm">
                            <!-- Form fields will be dynamically added here -->
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" id="cancelEdit">Cancel</button>
                        <button class="btn-primary" id="saveProfile">Save Changes</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Attach event listeners to the UI elements
    attachEventListeners() {
        // Edit profile button
        document.getElementById('editProfileBtn')?.addEventListener('click', () => {
            this.showEditModal();
        });

        // Add relationship button
        document.getElementById('addRelationshipBtn')?.addEventListener('click', () => {
            this.showAddRelationshipModal();
        });

        // Add note button
        document.getElementById('addNoteBtn')?.addEventListener('click', () => {
            this.showAddNoteModal();
        });

        // Upload document button
        document.getElementById('uploadDocumentBtn')?.addEventListener('click', () => {
            this.showUploadDocumentModal();
        });

        // Modal close buttons
        document.getElementById('closeEditModal')?.addEventListener('click', () => {
            this.hideEditModal();
        });

        // Save profile button
        document.getElementById('saveProfile')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.saveProfileChanges();
        });
    }

    // Load and display client data
    loadClient(clientId) {
        this.currentClient = this.clientManager.getClient(clientId);
        if (this.currentClient) {
            this.updateDisplay();
        }
    }

    // Update the display with current client data
    updateDisplay() {
        if (!this.currentClient) return;

        // Update basic information
        document.getElementById('clientName').textContent = this.currentClient.name || '';
        document.getElementById('clientEmail').textContent = this.currentClient.email || '';
        document.getElementById('clientPhone').textContent = this.currentClient.phone || '';
        document.getElementById('clientCategory').textContent = this.currentClient.category || '';

        // Update dates
        document.getElementById('nextRenewal').textContent = 
            this.formatDate(this.currentClient.policyRenewalDate);
        document.getElementById('lastContact').textContent = 
            this.formatDate(this.currentClient.lastContactDate);
        document.getElementById('clientSince').textContent = 
            this.formatDate(this.currentClient.createdAt);

        // Update preferences
        document.getElementById('preferredContact').textContent = 
            this.currentClient.preferredContact || '';
        document.getElementById('bestTime').textContent = 
            this.currentClient.bestTimeToContact || '';
        document.getElementById('newsletter').textContent = 
            this.currentClient.newsletterSubscribed ? 'Subscribed' : 'Not Subscribed';

        // Update relationships
        this.updateRelationshipsList();

        // Update notes timeline
        this.updateNotesTimeline();

        // Update documents grid
        this.updateDocumentsGrid();

        // Update status indicator
        this.updateStatusIndicator();
    }

    // Format date for display
    formatDate(dateString) {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Show edit profile modal
    showEditModal() {
        const modal = document.getElementById('editProfileModal');
        if (modal) {
            modal.classList.add('active');
            this.populateEditForm();
        }
    }

    // Hide edit profile modal
    hideEditModal() {
        const modal = document.getElementById('editProfileModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Additional methods will be implemented as needed
}

// Export the ClientProfile class
window.ClientProfile = ClientProfile;

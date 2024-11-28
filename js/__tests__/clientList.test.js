/**
 * @jest-environment jsdom
 */

describe('ClientList', () => {
    let clientList;
    let container;
    let mockClientManager;

    // Mock clients data
    const mockClients = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            category: 'individual',
            status: 'active',
            policies: [{ id: 1 }],
            quotes: [{ id: 1 }, { id: 2 }],
            lastContactDate: '2023-12-01'
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '987-654-3210',
            category: 'business',
            status: 'prospect',
            policies: [],
            quotes: [{ id: 3 }],
            lastContactDate: '2023-11-15'
        },
        {
            id: 3,
            name: 'Bob Johnson',
            email: 'bob@example.com',
            phone: '555-555-5555',
            category: 'individual',
            status: 'inactive',
            policies: [{ id: 2 }, { id: 3 }],
            quotes: [],
            lastContactDate: '2023-10-30'
        }
    ];

    beforeEach(() => {
        // Create container element
        container = document.createElement('div');
        container.id = 'clientListView';
        document.body.appendChild(container);

        // Mock ClientManager
        mockClientManager = {
            clients: [...mockClients],
            searchClients: jest.fn().mockImplementation(query => 
                mockClients.filter(client => 
                    client.name.toLowerCase().includes(query.toLowerCase()) ||
                    client.email.toLowerCase().includes(query.toLowerCase())
                )
            )
        };

        // Mock window.ClientManager
        window.ClientManager = jest.fn().mockImplementation(() => mockClientManager);

        // Initialize ClientList
        clientList = new ClientList('clientListView');
        clientList.initialize();
    });

    afterEach(() => {
        document.body.removeChild(container);
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        test('should render list container with filters', () => {
            expect(container.querySelector('.client-list')).toBeTruthy();
            expect(container.querySelector('#statusFilter')).toBeTruthy();
            expect(container.querySelector('#categoryFilter')).toBeTruthy();
            expect(container.querySelector('#clientSearch')).toBeTruthy();
        });

        test('should initialize with grid view by default', () => {
            expect(container.querySelector('.client-grid')).toBeTruthy();
            expect(container.querySelector('.client-table')).toBeFalsy();
        });

        test('should load initial clients', () => {
            const clientCards = container.querySelectorAll('.client-card');
            expect(clientCards.length).toBe(mockClients.length);
        });
    });

    describe('View Toggling', () => {
        test('should switch between grid and table views', () => {
            const viewToggle = container.querySelector('#viewToggle');
            
            // Switch to table view
            viewToggle.click();
            expect(container.querySelector('.client-table')).toBeTruthy();
            expect(container.querySelector('.client-grid')).toBeFalsy();
            
            // Switch back to grid view
            viewToggle.click();
            expect(container.querySelector('.client-grid')).toBeTruthy();
            expect(container.querySelector('.client-table')).toBeFalsy();
        });
    });

    describe('Filtering and Searching', () => {
        test('should filter by status', () => {
            const statusFilter = container.querySelector('#statusFilter');
            statusFilter.value = 'active';
            statusFilter.dispatchEvent(new Event('change'));

            const clientCards = container.querySelectorAll('.client-card');
            expect(clientCards.length).toBe(1);
            expect(clientCards[0].textContent).toContain('John Doe');
        });

        test('should filter by category', () => {
            const categoryFilter = container.querySelector('#categoryFilter');
            categoryFilter.value = 'business';
            categoryFilter.dispatchEvent(new Event('change'));

            const clientCards = container.querySelectorAll('.client-card');
            expect(clientCards.length).toBe(1);
            expect(clientCards[0].textContent).toContain('Jane Smith');
        });

        test('should search clients', () => {
            const searchInput = container.querySelector('#clientSearch');
            searchInput.value = 'john';
            searchInput.dispatchEvent(new Event('input'));

            expect(mockClientManager.searchClients).toHaveBeenCalledWith('john');
            const clientCards = container.querySelectorAll('.client-card');
            expect(clientCards.length).toBe(1);
            expect(clientCards[0].textContent).toContain('John Doe');
        });

        test('should combine filters', () => {
            const statusFilter = container.querySelector('#statusFilter');
            const categoryFilter = container.querySelector('#categoryFilter');
            
            statusFilter.value = 'active';
            categoryFilter.value = 'individual';
            
            statusFilter.dispatchEvent(new Event('change'));
            categoryFilter.dispatchEvent(new Event('change'));

            const clientCards = container.querySelectorAll('.client-card');
            expect(clientCards.length).toBe(1);
            expect(clientCards[0].textContent).toContain('John Doe');
        });
    });

    describe('Client Card Display', () => {
        test('should display correct client information in grid view', () => {
            const firstCard = container.querySelector('.client-card');
            
            expect(firstCard.textContent).toContain('John Doe');
            expect(firstCard.textContent).toContain('john@example.com');
            expect(firstCard.textContent).toContain('123-456-7890');
            expect(firstCard.querySelector('.status-badge').textContent).toBe('active');
        });

        test('should display metrics correctly', () => {
            const firstCard = container.querySelector('.client-card');
            const metrics = firstCard.querySelectorAll('.metric');
            
            expect(metrics[0].textContent).toContain('1'); // Policies
            expect(metrics[1].textContent).toContain('2'); // Quotes
        });
    });

    describe('Table View Display', () => {
        beforeEach(() => {
            const viewToggle = container.querySelector('#viewToggle');
            viewToggle.click(); // Switch to table view
        });

        test('should display correct headers in table view', () => {
            const headers = container.querySelectorAll('th');
            const expectedHeaders = ['Name', 'Status', 'Category', 'Email', 'Phone', 'Policies', 'Last Contact', 'Actions'];
            
            headers.forEach((header, index) => {
                expect(header.textContent).toBe(expectedHeaders[index]);
            });
        });

        test('should display correct client data in rows', () => {
            const firstRow = container.querySelector('tbody tr');
            const cells = firstRow.querySelectorAll('td');
            
            expect(cells[0].textContent).toBe('John Doe');
            expect(cells[2].textContent).toBe('individual');
            expect(cells[3].textContent).toBe('john@example.com');
            expect(cells[5].textContent).toBe('1');
        });
    });

    describe('Action Buttons', () => {
        test('should have working view button', () => {
            const viewButton = container.querySelector('button[onclick^="viewClient"]');
            
            // Mock global viewClient function
            window.viewClient = jest.fn();
            viewButton.click();
            
            expect(window.viewClient).toHaveBeenCalledWith(1);
        });

        test('should have working edit button', () => {
            const editButton = container.querySelector('button[onclick^="editClient"]');
            
            // Mock global editClient function
            window.editClient = jest.fn();
            editButton.click();
            
            expect(window.editClient).toHaveBeenCalledWith(1);
        });

        test('should have working contact button', () => {
            const contactButton = container.querySelector('button[onclick^="contactClient"]');
            
            // Mock global contactClient function
            window.contactClient = jest.fn();
            contactButton.click();
            
            expect(window.contactClient).toHaveBeenCalledWith(1);
        });
    });

    describe('Pagination', () => {
        test('should display correct client count', () => {
            const totalCount = container.querySelector('#totalCount');
            expect(totalCount.textContent).toBe(mockClients.length.toString());
        });

        test('should disable pagination buttons when not needed', () => {
            const prevButton = container.querySelector('#prevPage');
            const nextButton = container.querySelector('#nextPage');
            
            expect(prevButton.disabled).toBe(true);
            expect(nextButton.disabled).toBe(true);
        });
    });
});

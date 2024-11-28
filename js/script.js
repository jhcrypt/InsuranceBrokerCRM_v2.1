// Main Application Script

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');

    // Initialize components
    let clientList = null;
    let documentList = null;
    let calendar = null;

    // Function to initialize calendar
    function initializeCalendar() {
        console.log('Initializing calendar');
        if (!calendar) {
            calendar = new Calendar();
        }
        calendar.initialize();
    }

    // Simple function to show a section
    function showSection(sectionId) {
        console.log('Showing section:', sectionId);

        // Hide all sections first
        document.querySelectorAll('main > section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show the selected section
        const section = document.getElementById(sectionId);
        if (section) {
            // Remove hidden class
            section.classList.remove('hidden');

            // Initialize or refresh components based on section
            if (sectionId === 'calendar') {
                console.log('Switching to calendar section');
                // Ensure the calendar container is visible
                section.style.display = 'flex';
                section.style.visibility = 'visible';
                section.style.opacity = '1';

                // Initialize calendar with a slight delay to ensure DOM is ready
                setTimeout(() => {
                    initializeCalendar();
                }, 0);
            } else if (sectionId === 'clients' && !clientList) {
                clientList = new ClientList('clientListView');
                clientList.initialize();
            } else if (sectionId === 'documents' && !documentList) {
                documentList = new DocumentList('documentListView');
                documentList.initialize();
            }

            // Update active state in navigation
            document.querySelectorAll('.sidebar a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + sectionId) {
                    link.classList.add('active');
                }
            });

            // Remove any existing modals
            document.querySelectorAll('.modal').forEach(modal => modal.remove());

            // Update URL hash without triggering hashchange
            const currentHash = window.location.hash.substring(1);
            if (currentHash !== sectionId) {
                history.pushState(null, '', `#${sectionId}`);
            }
        }
    }

    // Add click event listeners to all sidebar links
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const sectionId = this.getAttribute('href').substring(1);
            console.log('Navigation clicked:', sectionId);
            showSection(sectionId);
        });
    });

    // Handle initial page load
    const hash = window.location.hash.substring(1);
    const initialSection = hash || 'dashboard';
    console.log('Initial section:', initialSection);
    
    // Initialize calendar if starting on calendar page
    if (initialSection === 'calendar') {
        console.log('Starting on calendar page');
        setTimeout(() => {
            initializeCalendar();
        }, 0);
    }
    
    showSection(initialSection);

    // Handle browser back/forward
    window.addEventListener('popstate', function() {
        const newHash = window.location.hash.substring(1) || 'dashboard';
        console.log('Hash changed to:', newHash);
        showSection(newHash);
    });

    // Handle calendar button in top nav
    document.querySelector('.btn-calendar')?.addEventListener('click', function() {
        console.log('Calendar button clicked');
        showSection('calendar');
    });

    // Handle window resize for responsive layout
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            const calendarSection = document.getElementById('calendar');
            if (calendarSection && !calendarSection.classList.contains('hidden') && calendar) {
                console.log('Resizing calendar');
                calendar.renderDates();
            }
        }, 250);
    });

    // Debug: Monitor calendar section visibility
    const calendarSection = document.getElementById('calendar');
    if (calendarSection) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isHidden = calendarSection.classList.contains('hidden');
                    console.log('Calendar section visibility changed:', !isHidden);
                    if (!isHidden && calendar) {
                        console.log('Re-rendering calendar after visibility change');
                        setTimeout(() => {
                            calendar.renderDates();
                        }, 0);
                    }
                }
            });
        });

        observer.observe(calendarSection, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
});

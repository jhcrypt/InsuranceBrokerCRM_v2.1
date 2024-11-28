class Calendar {
    constructor() {
        console.log('Calendar constructor called');
        // Set current date to November 20th, 2023
        this.currentDate = new Date(2023, 10, 20); // Month is 0-based, so 10 = November
        this.selectedDate = new Date(2023, 10, 20);
        this.events = [];
        this.initialized = false;
    }

    initialize() {
        console.log('Calendar initialize called');
        if (this.initialized) {
            console.log('Calendar already initialized, re-rendering');
            this.render();
            return;
        }

        this.initialized = true;
        this.loadEvents();
        this.render();
        this.attachEventListeners();
    }

    render() {
        console.log('Calendar render called');
        this.updateCalendarTitle();
        this.renderDates();
        this.renderEvents();
    }

    updateCalendarTitle() {
        console.log('Updating calendar title');
        const monthTitle = document.querySelector('.calendar-navigation h3');
        if (monthTitle) {
            monthTitle.textContent = this.formatMonth(this.currentDate);
        }
    }

    renderDates() {
        console.log('Rendering calendar dates');
        const calendarDates = document.getElementById('calendarDates');
        if (!calendarDates) {
            console.error('Calendar dates container not found');
            return;
        }

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        // Calculate previous month's days
        const prevMonth = new Date(year, month, 0);
        const prevMonthDays = prevMonth.getDate();
        let prevMonthStartDay = prevMonthDays - startingDay + 1;
        
        let datesHtml = '';
        
        // Previous month days
        for (let i = 0; i < startingDay; i++) {
            datesHtml += `
                <div class="calendar-date empty">
                    <span>${prevMonthStartDay}</span>
                </div>
            `;
            prevMonthStartDay++;
        }
        
        // Current month days
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month, day);
            const isToday = day === 20; // Hardcoded for November 20th
            const isSelected = this.isSameDate(date, this.selectedDate);
            const hasEvents = this.getEventsForDate(date).length > 0;
            
            datesHtml += `
                <div class="calendar-date ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasEvents ? 'has-events' : ''}"
                     data-date="${date.toISOString()}">
                    <span>${day}</span>
                    ${hasEvents ? '<div class="event-indicator"></div>' : ''}
                </div>
            `;
        }
        
        // Next month days
        const remainingDays = 42 - (startingDay + totalDays); // 42 = 6 rows × 7 days
        for (let day = 1; day <= remainingDays; day++) {
            datesHtml += `
                <div class="calendar-date empty">
                    <span>${day}</span>
                </div>
            `;
        }
        
        calendarDates.innerHTML = datesHtml;
    }

    attachEventListeners() {
        console.log('Attaching calendar event listeners');
        
        // Navigation buttons
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            console.log('Previous month clicked');
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render();
        });

        document.getElementById('nextMonth')?.addEventListener('click', () => {
            console.log('Next month clicked');
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render();
        });

        // Add event button
        document.getElementById('addEventBtn')?.addEventListener('click', () => {
            console.log('Add event clicked');
            this.showAddEventModal();
        });

        // Date selection
        const calendarDates = document.getElementById('calendarDates');
        if (calendarDates) {
            calendarDates.addEventListener('click', (e) => {
                const dateCell = e.target.closest('.calendar-date');
                if (dateCell && !dateCell.classList.contains('empty')) {
                    console.log('Date selected:', dateCell.dataset.date);
                    this.selectedDate = new Date(dateCell.dataset.date);
                    this.render();
                }
            });
        }
    }

    loadEvents() {
        console.log('Loading calendar events');
        const savedEvents = localStorage.getItem('calendar_events');
        if (savedEvents) {
            this.events = JSON.parse(savedEvents).map(event => ({
                ...event,
                date: new Date(event.date)
            }));
        }
    }

    renderEvents() {
        console.log('Rendering events');
        const eventsList = document.getElementById('eventsList');
        if (!eventsList) {
            console.error('Events list container not found');
            return;
        }

        const dateEvents = this.getEventsForDate(this.selectedDate);
        
        if (dateEvents.length === 0) {
            eventsList.innerHTML = '<p class="no-events">No events scheduled for this day</p>';
            return;
        }

        eventsList.innerHTML = dateEvents.map(event => `
            <div class="event-item">
                <div class="event-time">${this.formatTime(event.time)}</div>
                <div class="event-details">
                    <h4>${event.title}</h4>
                    <p>${event.description || ''}</p>
                </div>
            </div>
        `).join('');
    }

    getEventsForDate(date) {
        return this.events.filter(event => 
            this.isSameDate(new Date(event.date), date)
        );
    }

    formatMonth(date) {
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    formatDate(date) {
        return date.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric' });
    }

    formatTime(time) {
        if (!time) return '';
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('default', { 
            hour: 'numeric', 
            minute: '2-digit'
        });
    }

    isToday(date) {
        return this.isSameDate(date, this.currentDate);
    }

    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    showAddEventModal() {
        console.log('Show add event modal called');
        // This will be implemented when we add event creation functionality
    }
}

// Export the Calendar class
window.Calendar = Calendar;

// Debug log when the script loads
console.log('Calendar class loaded');

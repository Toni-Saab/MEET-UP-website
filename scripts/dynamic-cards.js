class EventsManager {
    constructor(containerSelector, jsonPath) {
        this.container = document.querySelector(containerSelector);
        this.jsonPath = jsonPath;
    }

    loadCards() {
        fetch(this.jsonPath)
            .then((response) => response.ok ? response.json() : Promise.reject('Error loading JSON'))
            .then((data) => this.renderCards(data))
            .catch((error) => console.error(error));
    }

    renderCards(data) {
        this.container.innerHTML = '';
        data.forEach((item, index) => {
            const card = new EventCard(item, index + 1).generate();
            this.container.appendChild(card);
        });
    }
}

class EventCard {
    constructor(data, index) {
        this.data = data;
        this.index = index;
    }

    generate() {
        const li = document.createElement('li');
        li.className = 'nearby-events__list-item';

        li.innerHTML = `
            <hr>
            <article class="event-card">
                <div 
                    class="event-card__image" 
                    role="img" 
                    aria-label="Event image" 
                    style="background-image: url(${this.data.image})">
                    ${this.data.type === 'online' 
                        ? `<div class="event-card__item-online-badge">
                                <img src="media/images/icons/camera-gray-svg.svg" alt="Online Event" class="event-card__item-online-badge-icon">
                                <span>Online Event</span>
                            </div>` 
                        : ''}
                </div>
                <div class="event-card__details">
                    ${this.data.date ? `<p class="event-card__date">${this.formatDate(this.data.date)}</p>` : ''}
                    ${this.data.title ? `<h3 class="event-card__title">${this.data.title}</h3>` : ''}
                    ${this.data.description ? `<p class="event-card__description">${this.data.description}</p>` : ''}
                    ${this.data.theme ? `<p class="event-card__theme">${this.data.theme}${this.data.distance ? ` <span class="event-card__distance">(${this.data.distance} km)</span>` : ''}</p>` : ''}
                    ${this.data.attendees !== undefined ? `<p class="event-card__attendees"><span class="event-card__attendees-count">${this.data.attendees}</span> attendees</p>` : ''}
                </div>
            </article>
        `;

        return li;
    }

    formatDate(date) {
        return new Date(date).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const manager = new EventsManager('.nearby-events__list', '../JSON/events.json');
    manager.loadCards();
});

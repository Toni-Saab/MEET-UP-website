class StylesManager {
    constructor() {
        this.mobileStylesheet = document.querySelector('link[href="styles/mobile.css"]');
        this.desktopStylesheet = document.querySelector('link[href="styles/desktop.css"]');
        this.image = document.querySelector('.join-meetup__visual .join-meetup__image');
        this.buttonJoinMeetup = document.querySelector('.join-meetup__action');
        this.buttonJoinUs = document.querySelector('.join-us__action');
    }

    checkAndApplyStyles() {
        window.innerWidth <= 640 
            ? this.applyMobileStyles() 
            : this.applyDesktopStyles();
    }

    applyMobileStyles() {
        this.toggleStyles(true);
        this.moveImage(true);
        this.switchButton(true);
    }

    applyDesktopStyles() {
        this.toggleStyles(false);
        this.moveImage(false);
        this.switchButton(false);
    }

    toggleStyles(isMobile) {
        this.mobileStylesheet.disabled = !isMobile;
        this.desktopStylesheet.disabled = isMobile;
    }

    moveImage(isMobile) {
        const title = document.querySelector(".join-meetup__title");
        const description = document.querySelector(".join-meetup__description");
        const container = document.querySelector(".join-meetup__visual");

        isMobile && this.image && title && description
            ? description.parentNode.insertBefore(this.image, description)
            : this.image && container && container.appendChild(this.image);
    }

    switchButton(isMobile) {
        const activeButton = isMobile ? this.buttonJoinMeetup : this.buttonJoinUs;
        const inactiveButton = isMobile ? this.buttonJoinUs : this.buttonJoinMeetup;

        inactiveButton?.removeAttribute('id');
        this.addNavigationHandler(inactiveButton, false);

        activeButton?.setAttribute('id', 'goToJoinPage');
        this.addNavigationHandler(activeButton, true);
    }

    addNavigationHandler(button, add) {
        button?.removeEventListener('click', this.navigateToJoinPage);
        add && button?.addEventListener('click', this.navigateToJoinPage);
    }

    navigateToJoinPage() {
        window.location.href = 'join.html';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const stylesManager = new StylesManager();

    stylesManager.checkAndApplyStyles();

    window.addEventListener('resize', () => stylesManager.checkAndApplyStyles());
    window.matchMedia("(max-width: 640px)").addEventListener("change", () => stylesManager.checkAndApplyStyles());
});







class ContentManager {
    constructor() {
        this.headerElement = '.header';
        this.footerElement = '.footer';
        this.localStorageKeyForHeader = 'savedHeaderContent';
        this.localStorageKeyForFooter = 'savedFooterContent';
    }

    storeMainPageContent() {
        localStorage.setItem(this.localStorageKeyForHeader, document.querySelector(this.headerElement).innerHTML);
        localStorage.setItem(this.localStorageKeyForFooter, document.querySelector(this.footerElement).innerHTML);
    }

    loadStoredContent() {
        document.querySelector(this.headerElement).innerHTML = localStorage.getItem(this.localStorageKeyForHeader) || '';
        document.querySelector(this.footerElement).innerHTML = localStorage.getItem(this.localStorageKeyForFooter) || '';
    }
}

class Dropdown {
    constructor(selector) {
        this.container = document.querySelector(selector);
        this.button = this.container.querySelector('.filter-button');
        this.options = this.container.querySelector('.filter-options');
        this.buttonText = this.button.querySelector('.filter-button__text');
        this.links = this.options.querySelectorAll('a');
        this.init();
    }

    init() {
        this.button.addEventListener('click', () => this.toggle());
        document.addEventListener('click', (e) => 
            !this.container.contains(e.target) && this.options.classList.contains('open') && this.close()
        );
        this.links.forEach(link => link.addEventListener('click', (e) => this.selectOption(e)));
    }

    toggle() {
        const isOpen = this.options.classList.toggle('open');
        this.button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    selectOption(event) {
        event.preventDefault();
        this.buttonText.textContent = event.target.textContent;

        const filtersManager = window.filtersManager;
        if (filtersManager) {
            const filterGroup = this.options.id.split('-')[1];
            filtersManager.updateFilter(filterGroup, event.target.dataset.value);
        }

        this.close();
    }

    close() {
        this.options.classList.remove('open');
        this.button.setAttribute('aria-expanded', 'false');
    }
}

class FiltersManager {
    constructor(listSelector) {
        this.list = document.querySelector(listSelector);
        this.activeFilters = { online: null, theme: null, distance: null, category: null };
        this.init();
    }

    init() {
        this.setupTabListeners();
        this.setupDropdownListeners();
    }

    setupTabListeners() {
        const tabs = document.querySelectorAll('.events-nearby-list__tab');
        tabs.forEach(tab => tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('events-nearby-list__tab--active'));
            tab.classList.add('events-nearby-list__tab--active');
            this.updateFilter('online', tab.textContent.trim().toLowerCase() === 'online events' ? 'online' : null);
        }));
    }

    setupDropdownListeners() {
        ['theme', 'distance', 'category'].forEach(filterGroup => {
            document.querySelectorAll(`#filter-${filterGroup}-options a`).forEach(link =>
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.updateFilter(filterGroup, link.dataset.value);
                })
            );
        });
    }

    updateFilter(filterGroup, filterValue) {
        this.activeFilters[filterGroup] = filterValue;
        this.applyFilters();
    }

    applyFilters() {
        const cards = Array.from(this.list.querySelectorAll('.nearby-events__list-item'));

        this.activeFilters.distance === 'nearest'
            ? cards.sort((a, b) => this.getDistance(a) - this.getDistance(b))
            : this.activeFilters.distance === 'farthest'
            ? cards.sort((a, b) => this.getDistance(b) - this.getDistance(a))
            : null;

        cards.forEach(card => {
            let visible = this.applyTabFilter(card) &&
                          this.applyThemeFilter(card) &&
                          this.applyDistanceFilter(card) &&
                          this.applyDayTypeFilter(card);

            card.style.display = visible ? 'block' : 'none';
        });

        this.list.innerHTML = '';
        cards.forEach(card => this.list.appendChild(card));
    }

    getDistance(card) {
        return parseInt(card.querySelector('.event-card__distance').textContent.replace(/[^\d]/g, '') || 0);
    }

    applyTabFilter(card) {
        const eventType = card.querySelector('.event-card__item-online-badge') ? 'online' : 'offline';
        return !this.activeFilters.online || eventType === this.activeFilters.online;
    }

    applyThemeFilter(card) {
        const eventTheme = card.querySelector('.event-card__theme').textContent.trim().toLowerCase();
        return !this.activeFilters.theme || eventTheme.includes(this.activeFilters.theme.toLowerCase());
    }

    applyDistanceFilter(card) {
        const eventDistance = this.getDistance(card);
        return this.activeFilters.distance === 'under50km' ? eventDistance < 50 :
               this.activeFilters.distance === 'over50km' ? eventDistance >= 50 : true;
    }

    applyDayTypeFilter(card) {
        const eventDateStr = card.querySelector('.event-card__date').textContent.trim();
        const activeDays = this.activeFilters.category
            ? { weekend: ['Sat', 'Sun'], weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }[this.activeFilters.category]
            : null;
        return !activeDays || activeDays.some(day => eventDateStr.includes(day));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const filtersManager = new FiltersManager('.nearby-events__list');
    window.filtersManager = filtersManager;

    ['.nearby-events__filter-item:nth-child(1)',
     '.nearby-events__filter-item:nth-child(2)',
     '.nearby-events__filter-item:nth-child(3)']
    .forEach(selector => new Dropdown(selector));
});





class MapToggleButton {
    constructor(mapContainerSelector, browseButtonSelector) {
        this.mapContainer = document.querySelector(mapContainerSelector);
        this.browseButton = document.querySelector(browseButtonSelector);
        this.initialMapStyles = {
            filter: 'blur(0.25rem)',
            pointerEvents: 'none',
        };
        this.initialButtonPosition = 'absolute';
        this.isMapOpen = false;
        this.browseButton.addEventListener('click', this.toggleMapState.bind(this));
    }

    resetState() {
        Object.assign(this.mapContainer.style, this.initialMapStyles);
        this.browseButton.style.position = this.initialButtonPosition;
    }

    openMap() {
        this.mapContainer.style.filter = 'none';
        this.mapContainer.style.pointerEvents = 'auto';
        this.browseButton.style.position = 'static';
        this.isMapOpen = true;
    }

    closeMap() {
        this.resetState();
        this.isMapOpen = false;
    }

    toggleMapState() {
        this.isMapOpen ? this.closeMap() : this.openMap();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MapToggleButton('.events-nearby-map__container', '.events-nearby-map__browse-button');
});
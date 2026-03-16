function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function refreshState() {
    const availableCountries = rfParser.getAllCountriesOnPage();
    if (availableCountries.length > 0) {
        rfUI.createOrUpdatePanel(availableCountries, rfStorage.blacklistedCountries, (country, isBlocked) => {
            rfStorage.toggleCountry(country, isBlocked);
            rfUI.applyFilter(rfStorage.blacklistedCountries);
        });
        rfUI.applyFilter(rfStorage.blacklistedCountries);
    }
}

function setupObserver() {
    const container = document.querySelector('.b-content__inline_items') || document.body;
    const observer = new MutationObserver(debounce((mutations) => {
        const hasNewNodes = mutations.some(m => m.addedNodes.length > 0);
        if (hasNewNodes) {
            refreshState(); // Re-parse countries and re-render panel
        }
    }, 200));
    observer.observe(container, { childList: true, subtree: true });
}

function init() {
    rfStorage.load(() => {
        refreshState();
        setupObserver();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
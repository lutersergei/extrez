const rfStorage = {
    blacklistedCountries: [],
    targetVisibleCount: 36, // По умолчанию на странице rezka 36 карточек
    isPanelOpen: true,
    
    save: function() {
        chrome.storage.local.set({ 
            blacklistedCountries: this.blacklistedCountries,
            targetVisibleCount: this.targetVisibleCount,
            isPanelOpen: this.isPanelOpen
        });
    },
    
    load: function(callback) {
        chrome.storage.local.get(['blacklistedCountries', 'targetVisibleCount', 'isPanelOpen'], (result) => {
            if (result.blacklistedCountries) {
                this.blacklistedCountries = result.blacklistedCountries;
            }
            if (result.targetVisibleCount) {
                this.targetVisibleCount = result.targetVisibleCount;
            }
            if (result.isPanelOpen !== undefined) {
                this.isPanelOpen = result.isPanelOpen;
            }
            callback();
        });
    },

    toggleCountry: function(country, isBlocked) {
        if (isBlocked) {
            if (!this.blacklistedCountries.includes(country)) {
                this.blacklistedCountries.push(country);
            }
        } else {
            this.blacklistedCountries = this.blacklistedCountries.filter(c => c !== country);
        }
        this.save();
    },
    
    setTargetCount: function(count) {
        this.targetVisibleCount = count;
        this.save();
    },

    setPanelOpen: function(isOpen) {
        this.isPanelOpen = isOpen;
        this.save();
    }
};
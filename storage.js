const rfStorage = {
    blacklistedCountries: [],
    targetVisibleCount: 36, // По умолчанию на странице rezka 36 карточек
    
    save: function() {
        chrome.storage.local.set({ 
            blacklistedCountries: this.blacklistedCountries,
            targetVisibleCount: this.targetVisibleCount
        });
    },
    
    load: function(callback) {
        chrome.storage.local.get(['blacklistedCountries', 'targetVisibleCount'], (result) => {
            if (result.blacklistedCountries) {
                this.blacklistedCountries = result.blacklistedCountries;
            }
            if (result.targetVisibleCount) {
                this.targetVisibleCount = result.targetVisibleCount;
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
    }
};
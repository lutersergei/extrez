const rfStorage = {
    blacklistedCountries: [],
    
    save: function() {
        chrome.storage.local.set({ blacklistedCountries: this.blacklistedCountries });
    },
    
    load: function(callback) {
        chrome.storage.local.get(['blacklistedCountries'], (result) => {
            if (result.blacklistedCountries) {
                this.blacklistedCountries = result.blacklistedCountries;
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
    }
};
const rfStorage = {
    blacklistedCountries: [],
    targetVisibleCount: 36, // По умолчанию на странице rezka 36 карточек
    knownCountries: [],
    
    save: function() {
        chrome.storage.local.set({ 
            blacklistedCountries: this.blacklistedCountries,
            targetVisibleCount: this.targetVisibleCount,
            knownCountries: this.knownCountries
        });
    },
    
    load: function(callback) {
        chrome.storage.local.get(['blacklistedCountries', 'targetVisibleCount', 'knownCountries'], (result) => {
            if (result.blacklistedCountries) {
                this.blacklistedCountries = result.blacklistedCountries;
            }
            if (result.targetVisibleCount) {
                this.targetVisibleCount = result.targetVisibleCount;
            }
            
            let storedCountries = result.knownCountries || [];
            let allKnown = new Set([...storedCountries, ...this.blacklistedCountries]);
            this.knownCountries = Array.from(allKnown).sort();

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

    addKnownCountries: function(countries) {
        if (!Array.isArray(countries) || countries.length === 0) return;

        let beforeCount = this.knownCountries.length;
        let allKnown = new Set([...this.knownCountries, ...countries]);
        
        if (allKnown.size > beforeCount) {
            this.knownCountries = Array.from(allKnown).sort();
            this.save();
        }
    }
};

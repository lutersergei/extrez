const rfParser = {
    getMetaTokensFromItem: function(item) {
        const infoDiv = item.querySelector('.b-content__inline_item-link div');
        if (!infoDiv) return [];

        return infoDiv.textContent
            .split(',')
            .map(part => part.trim())
            .filter(Boolean);
    },

    isYearToken: function(token) {
        return /^\d{4}(\s*-\s*(\.\.\.|\d{4})?)?$/.test(token);
    },

    cleanToken: function(token) {
        return token
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/^[,;:.!?()[\]{}"']+|[,;:.!?()[\]{}"']+$/g, '')
            .trim();
    },

    normalizeCountryToken: function(token) {
        const cleaned = this.cleanToken(token);

        if (!cleaned) {
            return null;
        }

        if (this.isYearToken(cleaned)) {
            return null;
        }

        if (!/[A-Za-zА-Яа-яЁё]/.test(cleaned)) {
            return null;
        }

        return cleaned;
    },

    getCountriesFromItem: function(item) {
        const parts = this.getMetaTokensFromItem(item);
        if (parts.length <= 1) {
            return [];
        }

        const countries = [];

        for (let index = 1; index < parts.length; index += 1) {
            const token = parts[index];

            if (this.isYearToken(token)) {
                continue;
            }

            const country = this.normalizeCountryToken(token);
            if (country) {
                countries.push(country);
            }
        }
        
        return countries;
    },

    getCountryFromItem: function(item) {
        return this.getCountriesFromItem(item)[0] || null;
    },

    getAllCountriesOnPage: function() {
        const items = document.querySelectorAll('.b-content__inline_item');
        const countries = new Set();
        items.forEach(item => {
            this.getCountriesFromItem(item).forEach(country => countries.add(country));
        });
        return Array.from(countries).sort();
    }
};

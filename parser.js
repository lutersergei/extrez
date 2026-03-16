const rfParser = {
    getCountryFromItem: function(item) {
        const infoDiv = item.querySelector('.b-content__inline_item-link div');
        if (!infoDiv) return null;
        
        const text = infoDiv.textContent.trim();
        const parts = text.split(',').map(p => p.trim());
        
        if (parts.length >= 2) {
            return parts[1];
        }
        return null;
    },

    getAllCountriesOnPage: function() {
        const items = document.querySelectorAll('.b-content__inline_item');
        const countries = new Set();
        items.forEach(item => {
            const country = this.getCountryFromItem(item);
            if (country) countries.add(country);
        });
        return Array.from(countries).sort();
    }
};
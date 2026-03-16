const rfUI = {
    panel: null,
    shadow: null,

    createOrUpdatePanel: function(availableCountries, blacklistedCountries, onToggle) {
        if (!this.panel) {
            const host = document.createElement('div');
            host.id = 'rf-panel-host';
            host.style.position = 'fixed';
            host.style.right = '20px';
            host.style.top = '100px';
            host.style.zIndex = '999999';
            document.body.appendChild(host);

            this.shadow = host.attachShadow({ mode: 'open' });
            
            const style = document.createElement('style');
            style.textContent = `
                .panel { background: #1e1e1e; color: #fff; padding: 15px; border-radius: 8px; font-family: sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.5); width: 200px; max-height: 80vh; overflow-y: auto;}
                h3 { margin-top: 0; font-size: 16px; border-bottom: 1px solid #444; padding-bottom: 8px; }
                label { display: flex; align-items: center; margin-bottom: 8px; cursor: pointer; font-size: 14px; }
                input { margin-right: 8px; }
            `;
            this.shadow.appendChild(style);

            this.panel = document.createElement('div');
            this.panel.className = 'panel';
            this.shadow.appendChild(this.panel);
        }

        this.panel.innerHTML = '<h3>Фильтр стран</h3>';
        
        availableCountries.forEach(country => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = country;
            checkbox.checked = blacklistedCountries.includes(country);
            
            checkbox.addEventListener('change', (e) => {
                onToggle(country, e.target.checked);
            });
            
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(country));
            this.panel.appendChild(label);
        });
    },

    applyFilter: function(blacklistedCountries) {
        const items = document.querySelectorAll('.b-content__inline_item');
        items.forEach(item => {
            const country = rfParser.getCountryFromItem(item);
            if (country && blacklistedCountries.includes(country)) {
                item.classList.add('rf-hidden');
            } else {
                item.classList.remove('rf-hidden');
            }
        });
    }
};
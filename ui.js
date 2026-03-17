const rfUI = {
    panel: null,
    shadow: null,

    createOrUpdatePanel: function(availableCountries, blacklistedCountries, targetVisibleCount, onToggle, onCountChange) {
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
                .panel { background: #1e1e1e; color: #fff; padding: 15px; border-radius: 8px; font-family: sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.5); width: 220px; max-height: 80vh; display: flex; flex-direction: column; }
                .scrollable { overflow-y: auto; flex-grow: 1; margin-top: 10px; }
                h3 { margin-top: 0; font-size: 16px; border-bottom: 1px solid #444; padding-bottom: 8px; margin-bottom: 10px; }
                label.country { display: flex; align-items: center; margin-bottom: 8px; cursor: pointer; font-size: 14px; }
                input[type="checkbox"] { margin-right: 8px; }
                .settings { margin-bottom: 5px; padding-bottom: 15px; border-bottom: 1px solid #444; }
                .settings span { display: block; margin-bottom: 5px; font-size: 13px; color: #ccc; }
                .settings input[type="number"] { width: 60px; padding: 4px; border-radius: 4px; border: 1px solid #555; background: #333; color: #fff; }
                .status { margin-top: 10px; font-size: 12px; color: #888; text-align: center; }
            `;
            this.shadow.appendChild(style);

            this.panel = document.createElement('div');
            this.panel.className = 'panel';
            this.shadow.appendChild(this.panel);
        }

        this.panel.innerHTML = `
            <h3>Фильтр сериалов</h3>
            <div class="settings">
                <label>
                    <span>Желаемое кол-во карточек:</span>
                    <input type="number" id="rf-target-count" min="1" max="1000" value="${targetVisibleCount}">
                </label>
            </div>
            <div class="counter" style="margin-bottom: 10px; font-size: 13px; color: #ccc;">
                Скрыто: <b id="rf-hidden-count">0</b>
            </div>
            <div id="rf-countries-list" class="scrollable"></div>
            <div id="rf-status" class="status"></div>
        `;
        
        const countInput = this.panel.querySelector('#rf-target-count');
        countInput.addEventListener('change', (e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val > 0) {
                onCountChange(val);
            }
        });

        const listContainer = this.panel.querySelector('#rf-countries-list');
        
        availableCountries.forEach(country => {
            const label = document.createElement('label');
            label.className = 'country';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = country;
            checkbox.checked = blacklistedCountries.includes(country);
            
            checkbox.addEventListener('change', (e) => {
                onToggle(country, e.target.checked);
            });
            
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(country));
            listContainer.appendChild(label);
        });
    },

    applyFilter: function(blacklistedCountries) {
        const items = document.querySelectorAll('.b-content__inline_item');
        let hiddenCount = 0;
        items.forEach(item => {
            const country = rfParser.getCountryFromItem(item);
            if (country && blacklistedCountries.includes(country)) {
                item.classList.add('rf-hidden');
                hiddenCount++;
            } else {
                item.classList.remove('rf-hidden');
            }
        });
        
        if (this.panel) {
            const countSpan = this.panel.querySelector('#rf-hidden-count');
            if (countSpan) countSpan.textContent = hiddenCount;
        }
    },
    
    setStatus: function(text) {
        if (this.panel) {
            const statusDiv = this.panel.querySelector('#rf-status');
            if (statusDiv) statusDiv.textContent = text;
        }
    }
};
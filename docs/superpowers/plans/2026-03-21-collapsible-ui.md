# Collapsible UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the "Rezka Filter" side panel collapsible with a sliding animation and remember its open/closed state across sessions using `chrome.storage.local`.

**Architecture:** We will introduce a persistent `#rf-container` in the Shadow DOM that holds both the toggle button and the panel. State will be managed in `storage.js`, and `main.js` will act as the orchestrator to keep the modules decoupled.

**Tech Stack:** Vanilla JavaScript, CSS, Chrome Extension API (storage).

---

### Task 1: Update Storage Module

**Files:**
- Modify: `storage.js`

- [ ] **Step 1: Add `isPanelOpen` to `rfStorage` and update `load`**
Add `isPanelOpen: true` to the initial object and include it in the `chrome.storage.local.get` keys.

```javascript
const rfStorage = {
    blacklistedCountries: [],
    targetVisibleCount: 32,
    isPanelOpen: true, // New field

    load: function(callback) {
        chrome.storage.local.get(['blacklistedCountries', 'targetVisibleCount', 'isPanelOpen'], (result) => {
            if (result.blacklistedCountries) this.blacklistedCountries = result.blacklistedCountries;
            if (result.targetVisibleCount) this.targetVisibleCount = result.targetVisibleCount;
            if (result.isPanelOpen !== undefined) this.isPanelOpen = result.isPanelOpen;
            callback();
        });
    },
    // ...
```

- [ ] **Step 2: Add `setPanelOpen` method**
Implement a method to save the panel state.

```javascript
    setPanelOpen: function(isOpen) {
        this.isPanelOpen = isOpen;
        chrome.storage.local.set({ isPanelOpen: isOpen });
    },
```

- [ ] **Step 3: Commit**
```bash
git add storage.js
git commit -m "feat(storage): add isPanelOpen state and persistence"
```

---

### Task 2: Refactor UI Module Structure and CSS

**Files:**
- Modify: `ui.js`

- [ ] **Step 1: Update CSS in `createOrUpdatePanel`**
Add styles for the container, sliding animation, and toggle button. Change host positioning to `right: 0`.

```javascript
            host.style.right = '0'; // Change from 20px
            // ... inside style.textContent
            #rf-container { 
                position: fixed; 
                right: 0; 
                top: 100px; 
                transition: transform 0.3s ease-in-out; 
                z-index: 999999;
            }
            #rf-container.collapsed { 
                transform: translateX(100%); 
            }
            #rf-toggle-btn {
                position: absolute;
                left: -30px;
                top: 0;
                width: 30px;
                height: 30px;
                background: #1e1e1e;
                color: #fff;
                border: none;
                border-radius: 4px 0 0 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: -2px 0 5px rgba(0,0,0,0.3);
            }
            .panel { width: 220px; margin-right: 20px; } /* Add margin for spacing from edge */
```

- [ ] **Step 2: Initialize Persistent Container and Button**
Create the container and button only once.

```javascript
    panel: null,
    shadow: null,
    _onPanelToggle: null, // Store latest callback

    createOrUpdatePanel: function(allCountries, blacklistedCountries, targetVisibleCount, isPanelOpen, onToggle, onCountChange, onPanelToggle) {
        this._onPanelToggle = onPanelToggle;

        if (!this.panel) {
            // ... (host creation code)
            const container = document.createElement('div');
            container.id = 'rf-container';
            this.shadow.appendChild(container);

            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'rf-toggle-btn';
            toggleBtn.addEventListener('click', () => {
                if (this._onPanelToggle) {
                    const currentCollapsed = container.classList.contains('collapsed');
                    this._onPanelToggle(currentCollapsed); // If collapsed, we want to open it (true)
                }
            });
            container.appendChild(toggleBtn);

            this.panel = document.createElement('div');
            this.panel.className = 'panel';
            container.appendChild(this.panel);
        }
        
        const container = this.shadow.querySelector('#rf-container');
        const toggleBtn = this.shadow.querySelector('#rf-toggle-btn');
        
        if (isPanelOpen) {
            container.classList.remove('collapsed');
            toggleBtn.textContent = '›';
        } else {
            container.classList.add('collapsed');
            toggleBtn.textContent = '‹';
        }
        // ... (rest of innerHTML update)
```

- [ ] **Step 3: Commit**
```bash
git add ui.js
git commit -m "feat(ui): implement collapsible container and toggle button"
```

---

### Task 3: Integrate Logic in Main Module

**Files:**
- Modify: `main.js`

- [ ] **Step 1: Update `refreshState` to pass panel state and callback**
Pass `rfStorage.isPanelOpen` and a toggle callback to `rfUI.createOrUpdatePanel`.

```javascript
function refreshState() {
    // ...
    rfUI.createOrUpdatePanel(
        allCountriesToDisplay, 
        rfStorage.blacklistedCountries,
        rfStorage.targetVisibleCount,
        rfStorage.isPanelOpen, // Pass state
        (country, isBlocked) => {
            rfStorage.toggleCountry(country, isBlocked);
            refreshState();
        },
        (newCount) => {
            rfStorage.setTargetCount(newCount);
            checkAndFetchMore();
        },
        (isOpen) => { // Pass toggle callback
            rfStorage.setPanelOpen(isOpen);
            refreshState();
        }
    );
    // ...
}
```

- [ ] **Step 2: Manual Verification**
1. Load the extension in Chrome.
2. Open `rezka.fi`.
3. Click the toggle button `›` to collapse.
4. Refresh the page – panel should remain collapsed.
5. Click `‹` to expand.
6. Refresh the page – panel should remain expanded.

- [ ] **Step 3: Commit**
```bash
git add main.js
git commit -m "feat(main): integrate panel toggle state management"
```

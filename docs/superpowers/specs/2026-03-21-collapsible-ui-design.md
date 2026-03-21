# Collapsible UI Design Spec

## Goal
Make the "Rezka Filter" side panel collapsible with a sliding animation and remember its open/closed state across sessions using `chrome.storage.local`.

## Architecture & Changes

### 1. Storage Module (`storage.js`)
*   **State:** Add `isPanelOpen` (boolean, default `true`) to `rfStorage`.
*   **Load:** Update `rfStorage.load()` to retrieve `isPanelOpen`.
*   **Save:** Add `rfStorage.setPanelOpen(isOpen)` to save the state.

### 2. UI Module (`ui.js`)
*   **Structure:** Wrap the existing `.panel` content in a container and add a toggle button (`#rf-toggle-btn`) attached to the left edge of the panel.
*   **CSS (Shadow DOM):**
    *   Change `.panel` positioning to be fixed to the right edge (`right: 0`).
    *   Add `transition: transform 0.3s ease-in-out` for sliding.
    *   Add a `.collapsed` class that applies `transform: translateX(100%)` to hide the panel off-screen.
    *   Style the toggle button so it sticks out to the left when the panel is collapsed, remaining clickable (e.g., a tab or a floating circle attached to the panel's left border).
*   **Logic:**
    *   Update `createOrUpdatePanel` to accept `isPanelOpen` as a parameter (or read directly from `rfStorage`).
    *   Apply the `.collapsed` class based on `isPanelOpen`.
    *   Add an event listener to `#rf-toggle-btn` to:
        1. Toggle the `.collapsed` class on the panel.
        2. Update the button's icon (e.g., `>` when open, `<` or a filter icon when closed).
        3. Call a callback (or directly call `rfStorage.setPanelOpen`) to persist the new state.

### 3. Main/Initialization (`main.js` / `ui.js` integration)
*   Ensure the initial `refreshState()` call passes the `isPanelOpen` state to the UI creation logic so it renders correctly on first load.

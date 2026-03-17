function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

let isFetching = false;

async function checkAndFetchMore() {
    if (isFetching) return;
    
    const items = document.querySelectorAll('.b-content__inline_item');
    let visibleCount = 0;
    items.forEach(item => {
        if (!item.classList.contains('rf-hidden')) visibleCount++;
    });

    if (visibleCount < rfStorage.targetVisibleCount) {
        const nextButton = document.querySelector('.b-navigation__next');
        if (!nextButton) {
            rfUI.setStatus('Больше страниц нет');
            return;
        }
        
        const nextPageLink = nextButton.closest('a');
        if (!nextPageLink || !nextPageLink.href || nextPageLink.href.startsWith('javascript:')) {
            rfUI.setStatus('Больше страниц нет');
            return;
        }

        isFetching = true;
        rfUI.setStatus('Загрузка новых карточек...');
        
        try {
            const response = await fetch(nextPageLink.href);
            const text = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            
            const newItems = doc.querySelectorAll('.b-content__inline_item');
            const container = document.querySelector('.b-content__inline_items');
            
            const oldNav = document.querySelector('.b-navigation');

            if (newItems.length > 0 && container) {
                // Удаляем скрытые разделители (clear:both и т.п.) перед навигацией, чтобы карточки шли сплошным потоком
                if (oldNav) {
                    let prev = oldNav.previousElementSibling;
                    while (prev && !prev.classList.contains('b-content__inline_item')) {
                        const toRemove = prev;
                        prev = prev.previousElementSibling;
                        toRemove.remove();
                    }
                }

                newItems.forEach(item => {
                    if (oldNav) {
                        container.insertBefore(item, oldNav);
                    } else {
                        container.appendChild(item);
                    }
                });
            }

            // Обновляем блок навигации с новой страницы, чтобы следующий fetch нашел следующую ссылку
            const newNav = doc.querySelector('.b-navigation');
            if (oldNav && newNav) {
                oldNav.innerHTML = newNav.innerHTML;
            } else if (oldNav) {
                 oldNav.remove();
            }

            isFetching = false;
            rfUI.setStatus('');
            
            // Запускаем обновление панели и фильтров, это также рекурсивно вызовет checkAndFetchMore если надо
            refreshState();
            
        } catch (e) {
            console.error('Failed to fetch next page', e);
            isFetching = false;
            rfUI.setStatus('Ошибка загрузки');
        }
    } else {
        rfUI.setStatus(`Отображается: ${visibleCount}`);
    }
}

function refreshState() {
    const availableCountries = rfParser.getAllCountriesOnPage();
    if (availableCountries.length > 0) {
        rfUI.createOrUpdatePanel(
            availableCountries, 
            rfStorage.blacklistedCountries,
            rfStorage.targetVisibleCount,
            (country, isBlocked) => {
                rfStorage.toggleCountry(country, isBlocked);
                rfUI.applyFilter(rfStorage.blacklistedCountries);
                checkAndFetchMore();
            },
            (newCount) => {
                rfStorage.setTargetCount(newCount);
                checkAndFetchMore();
            }
        );
        rfUI.applyFilter(rfStorage.blacklistedCountries);
        checkAndFetchMore(); // Запускаем проверку подгрузки
    }
}

function setupObserver() {
    const container = document.querySelector('.b-content__inline_items') || document.body;
    const observer = new MutationObserver(debounce((mutations) => {
        // Игнорируем мутации, если мы сами сейчас добавляем элементы
        if (isFetching) return;
        const hasNewNodes = mutations.some(m => m.addedNodes.length > 0);
        if (hasNewNodes) {
            refreshState();
        }
    }, 200));
    observer.observe(container, { childList: true, subtree: true });
}

function init() {
    rfStorage.load(() => {
        refreshState();
        setupObserver();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
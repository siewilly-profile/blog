document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('page-transition');
    if (!overlay) return;
    const ENTRY_DELAY_MS = 50;
    const ENTRY_ANIMATION_MS = 680;
    const EXIT_ANIMATION_MS = 820;
    const ENTRY_FALLBACK_BUFFER_MS = 140;
    const EXIT_FALLBACK_BUFFER_MS = 180;
    let isNavigating = false;
    let pendingNavigationUrl = '';
    let entryFallbackTimer = null;
    let exitFallbackTimer = null;

    // 如果裡面還沒有印章，就自動生成
    if (overlay.innerHTML.trim() === '') {
        overlay.innerHTML = '<div class="transition-seal-container"><div class="transition-seal">栖</div></div>';
    }

    const clearEntryFallback = () => {
        if (entryFallbackTimer) {
            clearTimeout(entryFallbackTimer);
            entryFallbackTimer = null;
        }
    };

    const clearExitFallback = () => {
        if (exitFallbackTimer) {
            clearTimeout(exitFallbackTimer);
            exitFallbackTimer = null;
        }
    };

    const hideOverlayAfterEntry = () => {
        clearEntryFallback();
        overlay.style.pointerEvents = 'none';
        overlay.style.display = 'none';
        overlay.classList.remove('is-entering');
    };

    const navigateAfterExit = () => {
        clearExitFallback();
        if (!pendingNavigationUrl) return;
        const targetUrl = pendingNavigationUrl;
        pendingNavigationUrl = '';
        window.location.href = targetUrl;
    };

    const startEntryTransition = () => {
        overlay.style.display = 'flex';
        overlay.style.pointerEvents = 'auto';
        overlay.classList.remove('is-leaving');
        void overlay.offsetWidth;
        overlay.classList.add('is-entering');

        clearEntryFallback();
        entryFallbackTimer = setTimeout(
            hideOverlayAfterEntry,
            ENTRY_ANIMATION_MS + ENTRY_FALLBACK_BUFFER_MS
        );
    };

    const startExitTransition = (targetUrl) => {
        pendingNavigationUrl = targetUrl;
        overlay.style.pointerEvents = 'auto';
        overlay.style.display = 'flex';
        overlay.classList.remove('is-entering');
        void overlay.offsetWidth;
        overlay.classList.add('is-leaving');

        clearExitFallback();
        exitFallbackTimer = setTimeout(
            navigateAfterExit,
            EXIT_ANIMATION_MS + EXIT_FALLBACK_BUFFER_MS
        );
    };

    overlay.addEventListener('animationend', (event) => {
        if (event.target !== overlay) return;

        if (event.animationName === 'paperPullUpOut' && overlay.classList.contains('is-entering')) {
            hideOverlayAfterEntry();
            return;
        }

        if (event.animationName === 'paperDropIn' && overlay.classList.contains('is-leaving')) {
            navigateAfterExit();
        }
    });

    // 進場動畫：延遲一點點讓瀏覽器渲染出初始蓋住的狀態
    setTimeout(startEntryTransition, ENTRY_DELAY_MS);

    // 使用事件委派攔截所有內部連結，包含動態渲染出的文章與返回連結
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const rawHref = link.getAttribute('href');
        const target = link.getAttribute('target');

        // 例外情況：空連結、僅錨點、javascript/mailto/tel、新開分頁、下載連結、或按住 Ctrl/Cmd 鍵點擊
        if (!rawHref ||
            rawHref.startsWith('#') ||
            rawHref.startsWith('javascript:') ||
            rawHref.startsWith('mailto:') ||
            rawHref.startsWith('tel:') ||
            target === '_blank' ||
            link.hasAttribute('download') ||
            e.ctrlKey ||
            e.metaKey ||
            e.shiftKey ||
            e.altKey ||
            e.button !== 0) {
            return;
        }

        let resolvedUrl;
        try {
            resolvedUrl = new URL(rawHref, window.location.href);
        } catch (_err) {
            return;
        }

        // 僅攔截同網域內部頁面連結
        if (resolvedUrl.origin !== window.location.origin) {
            return;
        }

        // 同頁僅 hash 變化不做整頁轉場
        if (resolvedUrl.pathname === window.location.pathname &&
            resolvedUrl.search === window.location.search &&
            resolvedUrl.hash) {
            return;
        }

        if (isNavigating) {
            e.preventDefault();
            return;
        }

        e.preventDefault();
        isNavigating = true;
        startExitTransition(resolvedUrl.href);
    });

    // 處理瀏覽器「上一頁」的 BFCache 問题
    // 如果使用者按上一頁回來，此頁面可能是暫存的狀態（被蓋住的），需重新拉開遮罩
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            startEntryTransition();
        }
    });
});

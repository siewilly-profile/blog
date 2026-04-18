(() => {
    const ANIMATION_DURATION = 800;
    const NAVIGATION_DELAY = 760;

    let hideTimer = null;
    let navigateTimer = null;
    let isNavigating = false;

    function ensureTransitionSeal(overlay) {
        if (overlay.innerHTML.trim() === '') {
            overlay.innerHTML = '<div class="transition-seal-container"><div class="transition-seal">栖</div></div>';
        }
    }

    function clearTimers() {
        if (hideTimer !== null) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
        if (navigateTimer !== null) {
            clearTimeout(navigateTimer);
            navigateTimer = null;
        }
    }

    function showOverlay(overlay, pointerEvents) {
        overlay.style.display = 'flex';
        overlay.style.pointerEvents = pointerEvents;
    }

    function hideOverlay(overlay) {
        overlay.style.pointerEvents = 'none';
        overlay.style.display = 'none';
    }

    function playEnter(overlay) {
        if (!overlay) return;

        if (hideTimer !== null) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }

        showOverlay(overlay, 'none');
        overlay.classList.remove('is-leaving');
        overlay.classList.remove('is-entering');

        void overlay.offsetWidth;

        requestAnimationFrame(() => {
            overlay.classList.add('is-entering');
        });

        hideTimer = setTimeout(() => {
            if (!isNavigating) {
                hideOverlay(overlay);
            }
        }, ANIMATION_DURATION + 20);
    }

    function playLeave(overlay) {
        if (!overlay) return;

        if (hideTimer !== null) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }

        showOverlay(overlay, 'auto');
        overlay.classList.remove('is-entering');
        overlay.classList.remove('is-leaving');

        void overlay.offsetWidth;

        requestAnimationFrame(() => {
            overlay.classList.add('is-leaving');
        });
    }

    function resolveTargetUrl(link) {
        const rawHref = link.getAttribute('href');
        if (!rawHref || rawHref.startsWith('#')) {
            return null;
        }
        if (/^(mailto:|tel:|javascript:)/i.test(rawHref)) {
            return null;
        }

        try {
            return new URL(rawHref, window.location.href);
        } catch (_) {
            return null;
        }
    }

    function shouldSkipTransition(event, link, targetUrl) {
        if (!targetUrl) {
            return true;
        }
        if (event.defaultPrevented) {
            return true;
        }
        if (event.button !== 0) {
            return true;
        }
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return true;
        }
        if (link.hasAttribute('download')) {
            return true;
        }

        const target = (link.getAttribute('target') || '').toLowerCase();
        if (target === '_blank') {
            return true;
        }

        if (targetUrl.origin !== window.location.origin) {
            return true;
        }

        return targetUrl.href === window.location.href;
    }

    function navigateWithTransition(url) {
        const overlay = document.getElementById('page-transition');
        if (!overlay) {
            window.location.href = url;
            return;
        }

        if (isNavigating) {
            return;
        }

        isNavigating = true;
        playLeave(overlay);

        navigateTimer = setTimeout(() => {
            window.location.href = url;
        }, NAVIGATION_DELAY);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const overlay = document.getElementById('page-transition');
        if (!overlay) return;

        ensureTransitionSeal(overlay);
        playEnter(overlay);

        document.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }

            const link = target.closest('a[href]');
            if (!link) {
                return;
            }

            const targetUrl = resolveTargetUrl(link);
            if (shouldSkipTransition(event, link, targetUrl)) {
                return;
            }

            event.preventDefault();
            navigateWithTransition(targetUrl.href);
        }, true);

        window.PageTransition = window.PageTransition || {};
        window.PageTransition.navigate = (url) => {
            try {
                const parsed = new URL(url, window.location.href);
                if (parsed.href === window.location.href) {
                    return;
                }
                navigateWithTransition(parsed.href);
            } catch (_) {
                window.location.href = url;
            }
        };
    });

    // 處理瀏覽器「上一頁」的 BFCache 問题
    // 如果使用者按上一頁回來，此頁面可能是暫存狀態，需重新拉開遮罩
    window.addEventListener('pageshow', (event) => {
        if (!event.persisted) {
            return;
        }

        const overlay = document.getElementById('page-transition');
        if (!overlay) {
            return;
        }

        isNavigating = false;
        clearTimers();
        playEnter(overlay);
    });
})();

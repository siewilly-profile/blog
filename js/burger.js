document.addEventListener('DOMContentLoaded', function () {
    var path = window.location.pathname.replace(/\\/g, '/');
    var isInPages = path.indexOf('/pages/') !== -1;
    var prefix = isInPages ? '../' : '';
    var pagePrefix = isInPages ? '' : 'pages/';

    var filename = path.split('/').pop() || 'index.html';

    var navItems = [
        { text: '首頁', sub: 'Home', href: prefix + 'index.html', key: 'index.html' },
        { text: '題解', sub: 'Solution', href: pagePrefix + 'solution.html', key: 'solution.html' },
        { text: '部落格', sub: 'Blog', href: pagePrefix + 'blog.html', key: 'blog.html' },
        { text: '關於', sub: 'About', href: pagePrefix + 'about.html', key: 'about.html' },
        { text: '友鏈', sub: 'Friend', href: pagePrefix + 'freind.html', key: 'freind.html' }
    ];

    var burgerBtn = document.createElement('button');
    burgerBtn.className = 'burger-btn';
    burgerBtn.id = 'burger-btn';
    burgerBtn.setAttribute('aria-label', '開啟選單');
    burgerBtn.innerHTML =
        '<span class="burger-line"></span>' +
        '<span class="burger-line"></span>' +
        '<span class="burger-line"></span>';

    var navInner = document.querySelector('.nav-inner');
    if (navInner) {
        navInner.insertBefore(burgerBtn, navInner.firstChild);
    }

    var overlay = document.createElement('div');
    overlay.className = 'scroll-overlay';
    overlay.id = 'scroll-overlay';

    var sidebar = document.createElement('aside');
    sidebar.className = 'scroll-sidebar';
    sidebar.id = 'scroll-sidebar';

    var navLinksHtml = '';
    navItems.forEach(function (item, idx) {
        var isActive = (filename === item.key) ? ' active' : '';
        navLinksHtml +=
            '<a href="' + item.href + '" class="sidebar-link' + isActive + '" ' +
            'style="animation-delay: ' + (0.3 + idx * 0.08) + 's">' +
            '<span class="sidebar-link-seal">☯</span>' +
            '<span class="sidebar-link-text">' + item.text + '</span>' +
            '<span class="sidebar-link-sub">' + item.sub + '</span>' +
            '</a>';
    });

    sidebar.innerHTML =
        '<div class="scroll-rod"></div>' +
        '<div class="scroll-content">' +
            '<button class="scroll-close" id="scroll-close" aria-label="關閉選單">' +
                '<span class="close-x">✕</span>' +
            '</button>' +
            '<div class="sidebar-profile">' +
                '<div class="sidebar-avatar-wrap">' +
                    '<div class="sidebar-avatar-ring"></div>' +
                    '<img src="' + prefix + 'images/owner_avatar.jpg" alt="南宮有栖" class="sidebar-avatar" />' +
                    '<div class="sidebar-stamp">栖</div>' +
                '</div>' +
                '<h3 class="sidebar-name">南宮有栖</h3>' +
                '<p class="sidebar-sub">Code Player</p>' +
            '</div>' +
            '<div class="sidebar-stats">' +
                '<div class="stat-col">' +
                    '<span class="stat-val">5</span>' +
                    '<span class="stat-label">文章</span>' +
                '</div>' +
                '<span class="stat-divider"></span>' +
                '<div class="stat-col">' +
                    '<span class="stat-val">1</span>' +
                    '<span class="stat-label">分類</span>' +
                '</div>' +
                '<span class="stat-divider"></span>' +
                '<div class="stat-col">' +
                    '<span class="stat-val">4</span>' +
                    '<span class="stat-label">標籤</span>' +
                '</div>' +
            '</div>' +
            '<div class="sidebar-social">' +
                '<a href="mailto:your@email.com" class="social-icon" title="Email">' +
                    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>' +
                '</a>' +
                '<a href="https://github.com/" class="social-icon" target="_blank" title="GitHub">' +
                    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>' +
                '</a>' +
                '<a href="https://instagram.com/" class="social-icon" target="_blank" title="Instagram">' +
                    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>' +
                '</a>' +
                '<a href="https://discord.com/" class="social-icon" target="_blank" title="Discord">' +
                    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>' +
                '</a>' +
            '</div>' +
            '<nav class="sidebar-nav">' + navLinksHtml + '</nav>' +
            '<div class="sidebar-poem">' +
                '<span>以墨為鋒</span>' +
                '<span class="poem-dot">·</span>' +
                '<span>以碼會友</span>' +
            '</div>' +
        '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(sidebar);

    function openMenu() {
        burgerBtn.classList.add('is-open');
        overlay.classList.add('is-open');
        sidebar.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        burgerBtn.classList.remove('is-open');
        overlay.classList.remove('is-open');
        sidebar.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    burgerBtn.addEventListener('click', function () {
        if (sidebar.classList.contains('is-open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    overlay.addEventListener('click', closeMenu);
    document.getElementById('scroll-close').addEventListener('click', closeMenu);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && sidebar.classList.contains('is-open')) {
            closeMenu();
        }
    });
});

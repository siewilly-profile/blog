var contentTarget = document.getElementById('content');

function getCandidatePaths(pathFromPages) {
    var p = pathFromPages.replace(/^\/+/, '');
    var hasPages = (window.location.pathname || '/').indexOf('/pages/') >= 0;

    if (hasPages) {
        return ['../' + p, '/' + p, p];
    }

    return [p, '/' + p, '../' + p];
}

async function fetchFirstSuccessful(candidates) {
    var list = candidates || [];
    for (var i = 0; i < list.length; i++) {
        try {
            var res = await fetch(list[i] + '?t=' + new Date().getTime(), { cache: 'no-store' });
            if (res.ok) return res;
        } catch (_) {
            // Try next candidate.
        }
    }

    throw new Error('No fetch candidate succeeded');
}

function parseMarkdown(markdownText) {
    if (window.MarkdownRenderer && typeof window.MarkdownRenderer.parse === 'function') {
        return window.MarkdownRenderer.parse(markdownText || '');
    }

    if (window.marked && typeof window.marked.parse === 'function') {
        if (typeof window.marked.setOptions === 'function') {
            window.marked.setOptions({ gfm: true, breaks: true });
        }
        return window.marked.parse(markdownText || '');
    }

    return markdownText || '';
}

function enhanceMarkdown(container) {
    if (!container) return;

    if (window.MarkdownRenderer && typeof window.MarkdownRenderer.enhance === 'function') {
        window.MarkdownRenderer.enhance(container);
        return;
    }

    if (window.hljs && typeof window.hljs.highlightElement === 'function') {
        var blocks = container.querySelectorAll('pre code');
        blocks.forEach(function (block) {
            window.hljs.highlightElement(block);
        });
    }

    if (typeof window.renderMathInElement === 'function') {
        window.renderMathInElement(container, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false }
            ],
            throwOnError: false,
            strict: 'ignore',
            ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
        });
    }
}

function mountFriendComments() {
    var commentsHost = document.getElementById('comments');
    if (!commentsHost) return;

    function mount() {
        if (window.GiscusIntegration && typeof window.GiscusIntegration.mountGiscus === 'function') {
            window.GiscusIntegration.mountGiscus({
                containerSelector: '#comments',
                term: '/friend'
            });
            return true;
        }
        return false;
    }

    if (mount()) return;

    var isInPages = window.location.pathname.replace(/\\/g, '/').indexOf('/pages/') !== -1;
    var giscusPath = isInPages ? '../js/giscus.js' : 'js/giscus.js';
    import(giscusPath)
        .then(function () {
            mount();
        })
        .catch(function () {
            commentsHost.innerHTML = '<div class="comments-card giscus-hint"><p>留言模組載入失敗，請稍後重試。</p></div>';
        });
}

async function renderFriendMarkdown() {
    contentTarget.innerHTML = '<div class="loading-text" style="color: var(--ink-light); text-align: center; padding: 2rem;">正在載入友鏈...</div>';

    try {
        var response = await fetchFirstSuccessful(getCandidatePaths('posts/friend/friend_page.md'));

        var markdownText = await response.text();

        var html = '<div class="article-header" style="text-align: center; margin-bottom: 2rem;">';
        html += '<h1 class="article-title">友鏈</h1>';
        html += '</div>';

        // Render Markdown to HTML 
        var articleHtml = parseMarkdown(markdownText);
        html += '<div class="article-body">' + articleHtml + '</div>';
        html += '<section class="comments-panel" id="comments"></section>';

        contentTarget.innerHTML = html;
        var articleBodyEl = contentTarget.querySelector('.article-body');
        enhanceMarkdown(articleBodyEl);
        mountFriendComments();

    } catch (error) {
        contentTarget.innerHTML = '<div class="error-msg" style="text-align: center; color: #cc0000; padding: 2rem;">'
            + '<p>無法載入友鏈：friend_page.md</p>'
            + '</div>';
    }
}

renderFriendMarkdown();

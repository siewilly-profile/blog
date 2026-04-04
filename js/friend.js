var contentTarget = document.getElementById('content');

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
        var response = await fetch('../posts/friend/friend_page.md');
        if (!response.ok) {
            throw new Error('File not found');
        }

        var markdownText = await response.text();

        var html = '<div class="article-header" style="text-align: center; margin-bottom: 2rem;">';
        html += '<h1 class="article-title">友鏈</h1>';
        html += '</div>';

        // Render Markdown to HTML 
        html += '<div class="article-body">' + marked.parse(markdownText) + '</div>';
        html += '<section class="comments-panel" id="comments"></section>';

        contentTarget.innerHTML = html;
        mountFriendComments();

    } catch (error) {
        contentTarget.innerHTML = '<div class="error-msg" style="text-align: center; color: #cc0000; padding: 2rem;">'
            + '<p>無法載入友鏈：friend_page.md</p>'
            + '</div>';
    }
}

renderFriendMarkdown();

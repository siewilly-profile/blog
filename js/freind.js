var contentTarget = document.getElementById('content');

async function renderFreindMarkdown() {
    contentTarget.innerHTML = '<div class="loading-text" style="color: var(--ink-light); text-align: center; padding: 2rem;">正在載入友鏈...</div>';

    try {
        var response = await fetch('../posts/freind/friend_page.md');
        if (!response.ok) {
            throw new Error('File not found');
        }

        var markdownText = await response.text();

        var html = '<div class="article-header" style="text-align: center; margin-bottom: 2rem;">';
        html += '<h1 class="article-title">友鏈</h1>';
        html += '</div>';

        // Render Markdown to HTML 
        html += '<div class="article-body">' + marked.parse(markdownText) + '</div>';

        contentTarget.innerHTML = html;

    } catch (error) {
        contentTarget.innerHTML = '<div class="error-msg" style="text-align: center; color: #cc0000; padding: 2rem;">'
            + '<p>無法載入友鏈：friend_page.md</p>'
            + '</div>';
    }
}

renderFreindMarkdown();

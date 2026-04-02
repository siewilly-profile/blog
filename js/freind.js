var contentTarget = document.getElementById('content');

async function renderFreindMarkdown() {
    contentTarget.innerHTML = '<div class="loading-text" style="color: var(--ink-light); text-align: center; padding: 2rem;">正在載入友鏈...</div>';

    try {
        var response = await fetch('../posts/freind/friend_page.md');
        if (!response.ok) {
            throw new Error('File not found');
        }

        let markdownText = await response.text();

        // 尋找夥伴們大標題底下的內容，提取 YAML
        let parts = markdownText.split(/#\s*夥伴們\.?/i);
        let friendsHtml = '';

        if (parts.length > 1) {
            let partnersSection = parts[1];
            // 找出 ```yml 或 ```yaml 區塊
            let yamlMatch = partnersSection.match(/```(?:yml|yaml)\s*([\s\S]*?)```/);
            if (yamlMatch) {
                try {
                    let friendsData = jsyaml.load(yamlMatch[1]);
                    if (Array.isArray(friendsData)) {
                        friendsHtml = '<div class="friend-grid">';
                        friendsData.forEach(friend => {
                            // 提供預設頭像
                            let avatarUrl = friend.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name || 'Friend')}&background=random`;
                            friendsHtml += `
                                <a href="${friend.url || '#'}" target="_blank" class="friend-card">
                                    <img src="${avatarUrl}" alt="avatar" class="friend-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name || 'Friend')}&background=random'">
                                    <div class="friend-info">
                                        <div class="friend-name">${friend.name || 'Unknown'}</div>
                                        <div class="friend-desc">${friend.desc || ''}</div>
                                    </div>
                                </a>
                            `;
                        });
                        friendsHtml += '</div>';

                        // 將這段 yaml 區塊從原 markdown 移除，免得被 marked 重複渲染成純文字
                        markdownText = parts[0] + '# 夥伴們\n' + partnersSection.replace(yamlMatch[0], '');
                    }
                } catch (e) {
                    console.error("YAML parsing error", e);
                }
            }
        }

        var html = '<div class="article-header" style="text-align: center; margin-bottom: 2rem;">';
        html += '<h1 class="article-title">友鏈</h1>';
        html += '</div>';

        // Render Markdown to HTML 並接上解析出來的友鏈卡片
        html += '<div class="article-body">' + marked.parse(markdownText) + friendsHtml + '</div>';

        contentTarget.innerHTML = html;

    } catch (error) {
        contentTarget.innerHTML = '<div class="error-msg" style="text-align: center; color: #cc0000; padding: 2rem;">'
            + '<p>無法載入友鏈：friend_page.md</p>'
            + '</div>';
    }
}

renderFreindMarkdown();

var params = new URLSearchParams(window.location.search);
var postName = params.get('post');

if (postName) {
    renderMarkdown(postName);
} else {
    renderPostList();
}

async function renderMarkdown(slug) {
    var target = document.getElementById('content');
    target.innerHTML = '<div class="loading-text">正在載入文章...</div>';

    try {
        var response = await fetch('../posts/solution/' + slug + '.md');
        if (!response.ok) {
            throw new Error('File not found');
        }

        var markdownText = await response.text();
        var wordCount = markdownText.replace(/\s/g, '').length;
        var readTime = Math.max(1, Math.ceil(wordCount / 300));

        var postsData = [];
        try {
            var postsRes = await fetch('../posts/solution/posts.json');
            postsData = await postsRes.json();
        } catch (e) {}

        var postMeta = postsData.find(function(p) { return p.slug === slug; });
        var title = postMeta ? postMeta.title : slug;
        var date = postMeta ? postMeta.date : '';
        var tags = postMeta ? postMeta.tags || [] : [];

        document.title = title + ' — 南宫有栖';

        var html = '<div class="article-header">';
        html += '<a href="solution.html" class="back-link">← 返回题解列表</a>';
        html += '<h1 class="article-title">' + title + '</h1>';
        html += '<div class="article-meta">';
        if (date) {
            html += '<span class="meta-item"><span class="meta-icon">☰</span> ' + date + '</span>';
        }
        html += '<span class="meta-item"><span class="meta-icon">✍</span> ' + wordCount + ' 字</span>';
        html += '<span class="meta-item"><span class="meta-icon">⏳</span> ' + readTime + ' 分鐘</span>';
        html += '</div>';
        if (tags.length > 0) {
            html += '<div class="article-tags">';
            tags.forEach(function(tag) {
                html += '<span class="tag">' + tag + '</span>';
            });
            html += '</div>';
        }
        html += '</div>';
        html += '<div class="article-body">' + marked.parse(markdownText) + '</div>';

        target.innerHTML = html;

    } catch (error) {
        target.innerHTML = '<div class="error-msg">'
            + '<p>無法載入文章：' + slug + '.md</p>'
            + '<a href="solution.html">← 返回题解列表</a>'
            + '</div>';
    }
}

async function renderPostList() {
    var target = document.getElementById('content');
    target.innerHTML = '<div class="loading-text">正在載入文章列表...</div>';

    try {
        var response = await fetch('../posts/solution/posts.json');
        if (!response.ok) {
            throw new Error('Failed to fetch posts list');
        }

        var posts = await response.json();
        posts.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });

        var html = '<div class="post-list-header">';
        html += '<h1 class="post-list-title">题解筆記</h1>';
        html += '<p class="post-list-count">共 ' + posts.length + ' 篇文章</p>';
        html += '</div>';
        html += '<div class="post-list">';

        for (var i = 0; i < posts.length; i++) {
            var post = posts[i];
            var tags = post.tags || [];

            html += '<a href="solution.html?post=' + post.slug + '" class="post-card" id="post-' + post.slug + '">';
            html += '<div class="post-card-body">';
            html += '<div class="post-card-meta">';
            html += '<span class="meta-item"><span class="meta-icon">☰</span> ' + post.date + '</span>';
            html += '</div>';
            html += '<h2 class="post-card-title">' + post.title + '</h2>';

            if (post.description) {
                html += '<p class="post-card-desc">' + post.description + '</p>';
            }

            if (tags.length > 0) {
                html += '<div class="post-card-tags">';
                tags.forEach(function(tag) {
                    html += '<span class="tag">' + tag + '</span>';
                });
                html += '</div>';
            }

            html += '</div>';
            html += '</a>';
        }

        html += '</div>';
        target.innerHTML = html;

    } catch (error) {
        target.innerHTML = '<div class="error-msg"><p>無法載入文章列表</p></div>';
    }
}
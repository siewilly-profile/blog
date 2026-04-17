var params = new URLSearchParams(window.location.search);
var postName = params.get('post');
var currentTag = params.get('tag');
var searchQuery = params.get('q');
var currentPage = parseInt(params.get('page') || '1', 10);
var POSTS_PER_PAGE = 5;

if (isNaN(currentPage) || currentPage < 1) {
    currentPage = 1;
}

// DOM elements
var contentTarget = document.getElementById('content');
var searchInput = document.getElementById('search-input');
var tagsCloud = document.getElementById('tags-cloud');
var allPostsData = [];

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

async function importFirstSuccessful(candidates) {
    var list = candidates || [];
    for (var i = 0; i < list.length; i++) {
        try {
            await import(list[i]);
            return true;
        } catch (_) {
            // Try next candidate.
        }
    }

    return false;
}

async function ensureGiscusLoaded() {
    if (window.GiscusIntegration && typeof window.GiscusIntegration.mountGiscus === 'function') {
        return true;
    }

    return importFirstSuccessful(getCandidatePaths('js/giscus.js'));
}

async function ensureEngagementLoaded() {
    if (window.Engagement && typeof window.Engagement.trackPageView === 'function') {
        return true;
    }

    return importFirstSuccessful(getCandidatePaths('js/engagement.js'));
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

if (postName) {
    // 渲染單篇文章
    renderBlogMarkdown(postName);
} else {
    // 渲染文章列表
    renderBlogList();
}

async function fetchPosts() {
    if (allPostsData.length > 0) return allPostsData;
    try {
        var response = await fetchFirstSuccessful(getCandidatePaths('posts/blog/posts.json'));
        allPostsData = await response.json();
        allPostsData.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });
    } catch (e) {
        console.error('Failed to fetch posts.json', e);
    }
    return allPostsData;
}

async function renderBlogList() {
    contentTarget.innerHTML = '<div class="loading-text">正在載入文章...</div>';
    
    var posts = await fetchPosts();
    renderSidebarTags(posts);
    setupSearch();

    var filteredPosts = posts;

    // Search filter
    if (searchQuery) {
        var q = searchQuery.toLowerCase();
        filteredPosts = filteredPosts.filter(function(post) {
            return post.title.toLowerCase().indexOf(q) !== -1 || 
                   (post.description && post.description.toLowerCase().indexOf(q) !== -1);
        });
        if(searchInput) searchInput.value = searchQuery;
    }

    // Tag filter
    if (currentTag) {
        filteredPosts = filteredPosts.filter(function(post) {
            return post.tags && post.tags.includes(currentTag);
        });
    }

    // Build HTML for article list
    var html = '<div class="post-list-header">';
    if (searchQuery) {
        html += '<h1 class="post-list-title">搜尋: ' + searchQuery + '</h1>';
        html += '<a href="blog.html" class="back-link">← 清除搜尋結果</a>';
    } else if (currentTag) {
        html += '<h1 class="post-list-title">標籤: ' + currentTag + '</h1>';
        html += '<a href="blog.html" class="back-link">← 清除標籤過濾</a>';
    } else {
        html += '<h1 class="post-list-title">部落格</h1>';
        html += '<p class="post-list-count">共 ' + filteredPosts.length + ' 篇文章</p>';
    }
    html += '</div>';

    var totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
    var safePage = Math.min(currentPage, totalPages);
    var startIndex = (safePage - 1) * POSTS_PER_PAGE;
    var pagedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

    html += '<div class="post-list">';

    if (filteredPosts.length === 0) {
        html += '<div class="error-msg"><p>找不到符合條件的文章。</p></div>';
    }

    // Loop through and display matching posts for current page
    for (var i = 0; i < pagedPosts.length; i++) {
        var post = pagedPosts[i];
        var tags = post.tags || [];

        html += '<a href="blog.html?post=' + post.slug + '" class="post-card">';
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
    html += renderPagination(totalPages, safePage);
    contentTarget.innerHTML = html;
}

function renderPagination(totalPages, activePage) {
    if (totalPages <= 1) {
        return '';
    }

    var pageNumbers = getVisiblePageNumbers(totalPages, activePage, 2);
    var html = '<nav class="pagination" aria-label="文章分頁">';

    if (activePage > 1) {
        html += '<a class="pagination-link prev" href="' + buildPageUrl(activePage - 1) + '">← 上一頁</a>';
    }

    for (var i = 0; i < pageNumbers.length; i++) {
        if (pageNumbers[i] === '...') {
            html += '<span class="pagination-ellipsis">...</span>';
            continue;
        }

        var page = pageNumbers[i];
        var activeClass = page === activePage ? ' active' : '';
        html += '<a class="pagination-link page-number' + activeClass + '" href="' + buildPageUrl(page) + '">' + page + '</a>';
    }

    if (activePage < totalPages) {
        html += '<a class="pagination-link next" href="' + buildPageUrl(activePage + 1) + '">下一頁 →</a>';
    }

    html += '</nav>';
    return html;
}

function getVisiblePageNumbers(totalPages, activePage, siblingCount) {
    var numbers = [];
    var start = Math.max(2, activePage - siblingCount);
    var end = Math.min(totalPages - 1, activePage + siblingCount);

    numbers.push(1);

    if (start > 2) {
        numbers.push('...');
    }

    for (var i = start; i <= end; i++) {
        numbers.push(i);
    }

    if (end < totalPages - 1) {
        numbers.push('...');
    }

    if (totalPages > 1) {
        numbers.push(totalPages);
    }

    return numbers;
}

function buildPageUrl(page) {
    var queryParts = [];

    if (searchQuery) {
        queryParts.push('q=' + encodeURIComponent(searchQuery));
    }

    if (currentTag) {
        queryParts.push('tag=' + encodeURIComponent(currentTag));
    }

    if (page > 1) {
        queryParts.push('page=' + page);
    }

    if (queryParts.length === 0) {
        return 'blog.html';
    }

    return 'blog.html?' + queryParts.join('&');
}

function renderSidebarTags(posts) {
    if(!tagsCloud) return;
    
    // Count tag frequency
    var tagsSet = {};
    posts.forEach(function(post) {
        if(post.tags) {
            post.tags.forEach(function(tag) {
                tagsSet[tag] = (tagsSet[tag] || 0) + 1;
            });
        }
    });

    var keys = Object.keys(tagsSet);
    keys.sort(function(a, b) { 
        return tagsSet[b] - tagsSet[a]; 
    });

    // Build tags HTML
    var html = '';
    keys.forEach(function(tag) {
        var activeClass = (tag === currentTag) ? ' active' : '';
        html += '<a href="blog.html?tag=' + encodeURIComponent(tag) + '" class="tag' + activeClass + '">' + tag + ' (' + tagsSet[tag] + ')</a>';
    });
    
    if (keys.length === 0) {
        html = '<p style="color:var(--ink-light); font-size:14px;">暫無標籤</p>';
    }
    
    tagsCloud.innerHTML = html;
}

function setupSearch() {
    var searchBtn = document.getElementById('search-btn');
    if (!searchInput || !searchBtn) return;

    function doSearch() {
        var q = searchInput.value.trim();
        if(q) {
            window.location.href = 'blog.html?q=' + encodeURIComponent(q);
        } else {
            window.location.href = 'blog.html';
        }
    }

    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keypress', function(e) {
        if(e.key === 'Enter') {
            doSearch();
        }
    });
}

async function renderBlogMarkdown(slug) {
    contentTarget.innerHTML = '<div class="loading-text">正在載入文章...</div>';

    // Fetch posts purely to render sidebar tags
    var posts = await fetchPosts();
    renderSidebarTags(posts);
    setupSearch();

    try {
        var response = await fetchFirstSuccessful(getCandidatePaths('posts/blog/' + slug + '.md'));

        var markdownText = await response.text();
        // Calculate rough reading stats
        var wordCount = markdownText.replace(/\s/g, '').length;
        var readTime = Math.max(1, Math.ceil(wordCount / 300));

        var postMeta = allPostsData.find(function(p) { return p.slug === slug; });
        var title = postMeta ? postMeta.title : slug;
        var date = postMeta ? postMeta.date : '';
        var tags = postMeta ? postMeta.tags || [] : [];

        document.title = title + ' — 南宫有栖';

        var html = '<div class="article-header">';
        html += '<a href="blog.html" class="back-link">← 返回部落格推薦列</a>';
        html += '<h1 class="article-title">' + title + '</h1>';
        html += '<div class="article-meta">';
        if (date) {
            html += '<span class="meta-item"><span class="meta-icon">☰</span> ' + date + '</span>';
        }
        html += '<span class="meta-item"><span class="meta-icon">✍</span> ' + wordCount + ' 字</span>';
        html += '<span class="meta-item"><span class="meta-icon">⏳</span> ' + readTime + ' 分鐘</span>';
        html += '<span class="meta-item"><span class="meta-icon">👁</span> <span id="view-count">載入中...</span></span>';
        html += '</div>';
        if (tags.length > 0) {
            html += '<div class="article-tags">';
            tags.forEach(function(tag) {
                html += '<a href="blog.html?tag=' + encodeURIComponent(tag) + '" class="tag">' + tag + '</a>';
            });
            html += '</div>';
        }
        html += '</div>';
        
        // Render Markdown to HTML 
        var articleHtml = parseMarkdown(markdownText);
        html += '<div class="article-body">' + articleHtml + '</div>';
        html += '<section class="comments-panel" id="comments"></section>';

        contentTarget.innerHTML = html;

        var articleBodyEl = contentTarget.querySelector('.article-body');
        enhanceMarkdown(articleBodyEl);

        await ensureEngagementLoaded();
        await ensureGiscusLoaded();

        if (window.Engagement && typeof window.Engagement.trackPageView === 'function') {
            window.Engagement.trackPageView({
                displaySelector: '#view-count'
            }).then(function (views) {
                if (views === 0) {
                    var viewEl = document.getElementById('view-count');
                    if (viewEl) {
                        viewEl.textContent = '未啟用';
                    }
                }
            }).catch(function () {
                var viewEl = document.getElementById('view-count');
                if (viewEl) {
                    viewEl.textContent = '讀取失敗';
                }
            });
        }

        if (window.GiscusIntegration && typeof window.GiscusIntegration.mountGiscus === 'function') {
            window.GiscusIntegration.mountGiscus({
                containerSelector: '#comments',
                term: '/blog/' + slug
            });
        } else {
            var commentsHost = document.getElementById('comments');
            if (commentsHost) {
                commentsHost.innerHTML = '<div class="comments-card giscus-hint"><p>留言模組載入失敗，請稍後重試。</p></div>';
            }
        }

    } catch (error) {
        contentTarget.innerHTML = '<div class="error-msg">'
            + '<p>無法載入文章：' + slug + '.md</p>'
            + '<a href="blog.html">← 返回部落格</a>'
            + '</div>';
    }
}

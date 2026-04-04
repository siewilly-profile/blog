var params = new URLSearchParams(window.location.search);
var postName = params.get('post');
var currentTag = params.get('tag');
var searchQuery = params.get('q');
var currentPage = parseInt(params.get('page') || '1', 10);
var POSTS_PER_PAGE = 5;

if (isNaN(currentPage) || currentPage < 1) {
    currentPage = 1;
}

var categoryEl = document.getElementById('solution-category');
var category = categoryEl ? categoryEl.getAttribute('data-category') : '';
var categoryLabel = categoryEl ? categoryEl.getAttribute('data-label') : '';
var parentPage = categoryEl ? categoryEl.getAttribute('data-parent') : 'solution.html';

var searchInput = document.getElementById('search-input');
var tagsCloud = document.getElementById('tags-cloud');
var allPostsData = [];

if (postName) {
    renderMarkdown(postName);
} else {
    renderPostList();
}

async function fetchPosts() {
    if (allPostsData.length > 0) return allPostsData;
    try {
        var response = await fetch('../posts/solution/' + category + '/posts.json?t=' + new Date().getTime());
        if (response.ok) {
            allPostsData = await response.json();
            allPostsData.sort(function(a, b) {
                return new Date(b.date) - new Date(a.date);
            });
        }
    } catch (e) {
        console.error("Failed to fetch posts.json");
    }
    return allPostsData;
}

function renderSidebarTags(posts) {
    if(!tagsCloud) return;
    
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

    var pageName = location.pathname.split('/').pop();
    var html = '';
    keys.forEach(function(tag) {
        var activeClass = (tag === currentTag) ? ' active' : '';
        html += '<a href="' + pageName + '?tag=' + encodeURIComponent(tag) + '" class="tag' + activeClass + '">' + tag + ' (' + tagsSet[tag] + ')</a>';
    });
    
    if (keys.length === 0) {
        html = '<p style="color:var(--ink-light); font-size:14px;">暫無標籤</p>';
    }
    
    tagsCloud.innerHTML = html;
}

function setupSearch() {
    var searchBtn = document.getElementById('search-btn');
    searchInput = document.getElementById('search-input'); // re-grab in case
    if (!searchInput || !searchBtn) return;
    
    // Check if already bound to avoid duplicates if called multiple times
    if (searchInput.getAttribute('data-bound') === 'true') return;
    searchInput.setAttribute('data-bound', 'true');

    var pageName = location.pathname.split('/').pop();

    function doSearch() {
        var q = searchInput.value.trim();
        if(q) {
            window.location.href = pageName + '?q=' + encodeURIComponent(q);
        } else {
            window.location.href = pageName;
        }
    }

    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keypress', function(e) {
        if(e.key === 'Enter') {
            doSearch();
        }
    });
}

async function renderMarkdown(slug) {
    var target = document.getElementById('content');
    target.innerHTML = '<div class="loading-text">正在載入文章...</div>';

    var posts = await fetchPosts();
    renderSidebarTags(posts);
    setupSearch();

    try {
        var response = await fetch('../posts/solution/' + category + '/' + slug + '.md?t=' + new Date().getTime());
        if (!response.ok) {
            throw new Error('File not found');
        }

        var markdownText = await response.text();
        var wordCount = markdownText.replace(/\s/g, '').length;
        var readTime = Math.max(1, Math.ceil(wordCount / 300));

        var postMeta = posts.find(function(p) { return p.slug === slug; });
        var title = postMeta ? postMeta.title : slug;
        var date = postMeta ? postMeta.date : '';
        var tags = postMeta ? postMeta.tags || [] : [];

        var pageName = location.pathname.split('/').pop();
        document.title = title + ' — 南宫有栖';

        var html = '<div class="article-header">';
        html += '<a href="' + pageName + '" class="back-link">← 返回' + categoryLabel + '题解列表</a>';
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
                html += '<a href="' + pageName + '?tag=' + encodeURIComponent(tag) + '" class="tag">' + tag + '</a>';
            });
            html += '</div>';
        }
        html += '</div>';
        html += '<div class="article-body">' + marked.parse(markdownText) + '</div>';
        html += '<section class="comments-panel" id="comments"></section>';

        target.innerHTML = html;

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
                term: '/solution/' + category + '/' + slug
            });
        }

    } catch (error) {
        var pageName = location.pathname.split('/').pop();
        target.innerHTML = '<div class="error-msg">'
            + '<p>無法載入文章：' + slug + '.md</p>'
            + '<a href="' + pageName + '">← 返回' + categoryLabel + '题解列表</a>'
            + '</div>';
    }
}

async function renderPostList() {
    var target = document.getElementById('content');
    target.innerHTML = '<div class="loading-text">正在載入文章列表...</div>';

    var pageName = location.pathname.split('/').pop();
    var posts = await fetchPosts();
    
    if (!posts || posts.length === 0) {
        target.innerHTML = '<div class="error-msg"><p>找不到任何文章。</p></div>';
        return;
    }

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

    var html = '<div class="post-list-header">';
    if (searchQuery) {
        html += '<h1 class="post-list-title">搜尋: ' + searchQuery + ' (' + categoryLabel + ')</h1>';
        html += '<a href="' + pageName + '" class="back-link">← 清除搜尋結果</a>';
    } else if (currentTag) {
        html += '<h1 class="post-list-title">標籤: ' + currentTag + ' (' + categoryLabel + ')</h1>';
        html += '<a href="' + pageName + '" class="back-link">← 清除標籤過濾</a>';
    } else {
        html += '<a href="' + parentPage + '" class="back-link">← 返回题解分类</a>';
        html += '<h1 class="post-list-title">' + categoryLabel + ' 题解</h1>';
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

    for (var i = 0; i < pagedPosts.length; i++) {
        var post = pagedPosts[i];
        var tags = post.tags || [];

        html += '<a href="' + pageName + '?post=' + post.slug + '" class="post-card" id="post-' + post.slug + '">';
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
    html += renderPagination(totalPages, safePage, pageName);
    target.innerHTML = html;
}

function renderPagination(totalPages, activePage, pageName) {
    if (totalPages <= 1) {
        return '';
    }

    var pageNumbers = getVisiblePageNumbers(totalPages, activePage, 2);
    var html = '<nav class="pagination" aria-label="文章分頁">';

    if (activePage > 1) {
        html += '<a class="pagination-link prev" href="' + buildPageUrl(pageName, activePage - 1) + '">← 上一頁</a>';
    }

    for (var i = 0; i < pageNumbers.length; i++) {
        if (pageNumbers[i] === '...') {
            html += '<span class="pagination-ellipsis">...</span>';
            continue;
        }

        var page = pageNumbers[i];
        var activeClass = page === activePage ? ' active' : '';
        html += '<a class="pagination-link page-number' + activeClass + '" href="' + buildPageUrl(pageName, page) + '">' + page + '</a>';
    }

    if (activePage < totalPages) {
        html += '<a class="pagination-link next" href="' + buildPageUrl(pageName, activePage + 1) + '">下一頁 →</a>';
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

function buildPageUrl(pageName, page) {
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
        return pageName;
    }

    return pageName + '?' + queryParts.join('&');
}

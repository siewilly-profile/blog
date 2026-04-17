document.addEventListener('DOMContentLoaded', () => {
    const aboutContainer = document.getElementById('about-container');

    function getCandidatePaths(pathFromPages) {
        var p = pathFromPages.replace(/^\/+/, '');
        var hasPages = (window.location.pathname || '/').indexOf('/pages/') >= 0;

        if (hasPages) {
            return ['../' + p, '/' + p, p];
        }

        return [p, '/' + p, '../' + p];
    }

    function fetchFirstSuccessful(candidates) {
        var list = candidates || [];
        var index = 0;

        function next() {
            if (index >= list.length) {
                return Promise.reject(new Error('No fetch candidate succeeded'));
            }

            var url = list[index++] + '?t=' + new Date().getTime();
            return fetch(url, { cache: 'no-store' })
                .then(function (response) {
                    if (!response.ok) {
                        return next();
                    }
                    return response;
                })
                .catch(function () {
                    return next();
                });
        }

        return next();
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

    if (aboutContainer) {
        fetchFirstSuccessful(getCandidatePaths('posts/about/about.md'))
            .then(response => {
                return response.text();
            })
            .then(text => {
                if (window.MarkdownRenderer && typeof window.MarkdownRenderer.renderInto === 'function') {
                    window.MarkdownRenderer.renderInto(aboutContainer, text);
                } else {
                    if (window.marked && typeof window.marked.parse === 'function') {
                        if (typeof window.marked.setOptions === 'function') {
                            window.marked.setOptions({
                                breaks: true,
                                gfm: true
                            });
                        }
                        aboutContainer.innerHTML = window.marked.parse(text);
                        enhanceMarkdown(aboutContainer);
                    } else {
                        aboutContainer.textContent = text;
                    }
                }
            })
            .catch(error => {
                console.error('Error loading about.md:', error);
                aboutContainer.innerHTML = '<div class="content-box"><p>無法載入關於頁面內容。</p></div>';
            });
    }
});

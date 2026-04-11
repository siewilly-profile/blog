(function () {
    function configureMarked() {
        if (!window.marked || typeof window.marked.setOptions !== 'function') {
            return;
        }

        window.marked.setOptions({
            gfm: true,
            breaks: true
        });
    }

    function highlightCodeBlocks(container) {
        if (!container || !window.hljs || typeof window.hljs.highlightElement !== 'function') {
            return;
        }

        var blocks = container.querySelectorAll('pre code');
        blocks.forEach(function (block) {
            window.hljs.highlightElement(block);
        });
    }

    function renderMath(container) {
        if (!container || typeof window.renderMathInElement !== 'function') {
            return;
        }

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

    function parse(markdownText) {
        configureMarked();

        if (!window.marked || typeof window.marked.parse !== 'function') {
            return markdownText || '';
        }

        return window.marked.parse(markdownText || '');
    }

    function enhance(container) {
        highlightCodeBlocks(container);
        renderMath(container);
    }

    function renderInto(container, markdownText) {
        if (!container) {
            return;
        }

        container.innerHTML = parse(markdownText);
        enhance(container);
    }

    window.MarkdownRenderer = {
        parse: parse,
        enhance: enhance,
        renderInto: renderInto
    };
})();
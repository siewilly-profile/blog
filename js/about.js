document.addEventListener('DOMContentLoaded', () => {
    const aboutContainer = document.getElementById('about-container');
    const mdPath = '../posts/about/about.md';

    if (aboutContainer) {
        fetch(mdPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(text => {
                if (window.MarkdownRenderer && typeof window.MarkdownRenderer.renderInto === 'function') {
                    window.MarkdownRenderer.renderInto(aboutContainer, text);
                } else {
                    marked.setOptions({
                        breaks: true,
                        gfm: true
                    });
                    aboutContainer.innerHTML = marked.parse(text);
                }
            })
            .catch(error => {
                console.error('Error loading about.md:', error);
                aboutContainer.innerHTML = '<div class="content-box"><p>無法載入關於頁面內容。</p></div>';
            });
    }
});

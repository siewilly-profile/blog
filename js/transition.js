document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('page-transition');
    if (!overlay) return;

    // 如果裡面還沒有印章，就自動生成
    if (overlay.innerHTML.trim() === '') {
        overlay.innerHTML = '<div class="transition-seal-container"><div class="transition-seal">栖</div></div>';
    }

    // 進場動畫：延遲一點點讓瀏覽器渲染出初始蓋住的狀態
    setTimeout(() => {
        overlay.classList.add('is-entering');
    }, 50);

    // 等待動畫結束後，將遮罩隱藏並取消點擊阻擋
    setTimeout(() => {
        overlay.style.pointerEvents = 'none';
        overlay.style.display = 'none';
    }, 850);

    // 攔截所有連結被點擊的事件
    const links = document.querySelectorAll('a');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetUrl = this.getAttribute('href');
            const target = this.getAttribute('target');
            
            // 例外情況：空連結、錨點連結、外部 HTTP 連結、新開分頁、或按住 Ctrl/Cmd 鍵點擊
            if (!targetUrl || 
                targetUrl.startsWith('#') || 
                targetUrl.startsWith('http') || 
                target === '_blank' || 
                e.ctrlKey || 
                e.metaKey) {
                return;
            }

            // 阻止原本的直接跳轉
            e.preventDefault();
            
            // 讓遮罩回來，準備執行退場（蓋上）動畫
            overlay.style.display = 'flex';
            overlay.classList.remove('is-entering');
            
            // 強制重繪
            void overlay.offsetWidth;
            
            overlay.classList.add('is-leaving');
            
            // 動畫總長約 0.8s，這裡設定 0.75s 時進行跳轉，讓視覺更連貫
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 750);
        });
    });
});

// 處理瀏覽器「上一頁」的 BFCache 問题
// 如果使用者按上一頁回來，此頁面可能是暫存的狀態（被蓋住的），需重新拉開遮罩
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        const overlay = document.getElementById('page-transition');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.classList.remove('is-leaving');
            overlay.classList.add('is-entering');
            setTimeout(() => {
                overlay.style.pointerEvents = 'none';
                overlay.style.display = 'none';
            }, 850);
        }
    }
});

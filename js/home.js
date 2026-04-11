document.addEventListener('DOMContentLoaded', function () {
    createHeroParticles();
    initScrollAnimations();
    initSmoothScroll();
});

function createHeroParticles() {
    var container = document.getElementById('hero-particles');
    if (!container) return;

    for (var i = 0; i < 20; i++) {
        var particle = document.createElement('div');
        particle.classList.add('hero-particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 6 + 6) + 's';

        var size = Math.random() * 3 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        if (Math.random() > 0.5) {
            particle.style.background = 'rgba(194, 58, 43, 0.3)';
        }

        container.appendChild(particle);
    }
}

function initScrollAnimations() {
    var observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var el = entry.target;

                if (el.classList.contains('showcase-card')) {
                    var idx = Array.from(el.parentNode.children).indexOf(el);
                    setTimeout(function () {
                        el.classList.add('visible');
                    }, idx * 150);
                } else if (el.classList.contains('journey-item')) {
                    el.classList.add('visible');
                } else if (el.classList.contains('goal-item')) {
                    var goalIdx = Array.from(el.parentNode.children).indexOf(el);
                    setTimeout(function () {
                        el.classList.add('visible');
                    }, goalIdx * 100);
                }

                observer.unobserve(el);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.showcase-card').forEach(function (el) {
        observer.observe(el);
    });

    document.querySelectorAll('.journey-item').forEach(function (el) {
        observer.observe(el);
    });

    document.querySelectorAll('.goal-item').forEach(function (el) {
        observer.observe(el);
    });
}

function initSmoothScroll() {
    var scrollBtn = document.getElementById('hero-scroll-btn');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.getElementById('showcase');
            if (target) {
                var navHeight = parseInt(
                    getComputedStyle(document.documentElement).getPropertyValue('--nav-height')
                ) || 72;
                var targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                window.scrollTo({
                    top: targetPos,
                    behavior: 'smooth'
                });
            }
        });
    }
}

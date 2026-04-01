function createPetal() {
    var container = document.getElementById('petal-container');
    if (!container) return;

    var petal = document.createElement('div');
    petal.classList.add('petal');

    var petals = ['\uD83C\uDF38', '\uD83C\uDF42', '\uD83C\uDF43'];
    petal.textContent = petals[Math.floor(Math.random() * petals.length)];

    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.animationDuration = (Math.random() * 4 + 6) + 's';
    petal.style.animationDelay = Math.random() * 3 + 's';
    petal.style.fontSize = (Math.random() * 10 + 12) + 'px';
    petal.style.opacity = Math.random() * 0.5 + 0.3;

    container.appendChild(petal);

    setTimeout(function() {
        petal.remove();
    }, 12000);
}

setInterval(createPetal, 1500);

for (var i = 0; i < 5; i++) {
    setTimeout(createPetal, i * 400);
}

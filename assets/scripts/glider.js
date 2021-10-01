const slider = document.querySelector('#slider');

const glider = new Glider(slider, {
    draggable: true,
    arrows: {
        prev: '.glider-prev',
        next: '.glider-next'
    },
    dots: '.dots',
    scrollLock: true,
});

let timeout = -1;
let hovering = false;
function startTimeout() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        if (!hovering)
            glider.scrollItem((glider.slide + 1) % glider.slides.length);
    }, 5000);
}

let animID = 0;
const isAnimating = () => glider.animate_id !== animID;
slider.addEventListener('glider-animated', () => {
    animID = glider.animate_id;
    if (!hovering) startTimeout();
});

slider.addEventListener('mouseover', () => {
    hovering = true;
    clearTimeout(timeout);
});

slider.addEventListener('mouseout', () => {
    hovering = false;
    if (!isAnimating()) startTimeout();
});

startTimeout();
const navMenu = document.querySelector('.nav-menu');

const scrolledEffect = () => {
    window.scrollY > 50 ?
        navMenu.classList.add('scrolled') : navMenu.classList.remove('scrolled');
}

window.onscroll = scrolledEffect;
window.onload = scrolledEffect;
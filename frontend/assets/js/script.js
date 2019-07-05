const toggleMenu = document.querySelector('.toggle-menu');
let menu = document.querySelector('.menu');

toggleMenu.addEventListener('click', () => {
    menu.classList.toggle('-open');
});
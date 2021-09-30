const iconMenu = document.querySelector('.icon-menu');
const navMenuList = document.querySelector('.nav-menu__list');

iconMenu.addEventListener('click', () => {
    iconMenu.classList.toggle('change');
    navMenuList.classList.toggle('active');
});
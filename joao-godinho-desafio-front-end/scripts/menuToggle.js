(function () {
    const menuToggle = document.querySelector('div.menu-toggle');
    menuToggle.addEventListener('click', toggleMenu);

    function toggleMenu() {
        let menu = document.querySelector('div.menu-section');

        if (menu.classList.contains('on') == false) {
            menu.classList.add('on');
        } else {
            menu.classList.remove('on');
        };
    };

})();
$( document ).ready(function() {
    manageMenuClosed();
    manageMenuOpened();
    initDepositionsCarousel();
});

function initDepositionsCarousel() {
    jQuery("#depositions_carousel").slick({
        dots: true,
        arrows: false,
        fade: true,
        cssEase: 'linear'
    });
}

function manageMenuClosed() {
    jQuery(".menu-button-closed").on("click", function() {
        jQuery("nav.menu ul").addClass("active");
    });
}

function manageMenuOpened() {
    jQuery(".menu-button-opened").on("click", function() {
        jQuery("nav.menu ul").removeClass("active");
    });
}
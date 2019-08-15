$( document ).ready(function() {
    manageMenuClosed();
    manageMenuOpened();
});

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
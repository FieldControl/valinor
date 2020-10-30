(function($) {
    "use strict";

    // Smooth scrolling using jQuery easing
    $(document).on('click', 'a.smooth-scroll', function(e) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top)
        }, 650, 'easeInOutExpo');
        e.preventDefault();
    });
})(jQuery);
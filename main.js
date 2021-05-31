jQuery(document).ready(function($){
    //FIXED HEADER
    window.onscroll = function(){
        if(window.pageYOffset > 140) {
            $("#header").addClass("active")
        } else {
            $("#header").removeClass("active")
        }
    };
});

//Owl
$(".owl-carousel").owlCarousel({    
    loop: false,
    margin: 30,
    autoplay: true,
    autoplayTimeout: 6000,
    dots: true,
    lazyLoad: true,
    nav: false,
    responsive:{
        0:{
            items: 2,
        },
        600:{
            items: 2,
        },
        1000:{
            items: 2,
        },
    },
});
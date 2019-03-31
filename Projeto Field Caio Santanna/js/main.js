// ---------------- FUNÇÃO PARA MUDAR COR NAVBAR ----------------
$(window).on('scroll',function(){
	var scroll = $(window).scrollTop();
	if(scroll > 0){
		$('#navbar-main').addClass('navbar-in-page');
	}else{
		$('#navbar-main').removeClass('navbar-in-page');
	}
});
// --------------------------------------------------------------

// ---------------- SLIDE WORK 1 ----------------
$('.works-slider-1').slick({
	arrows: false,	
	centerMode: true,
	centerPadding: '100px',
	slidesToShow: 3,	
	autoplay: true,
  	autoplaySpeed: 3000,
  	dots: false,
  	infinite: true,  	
	variableWidth: true,
	responsive: [
		{
			breakpoint: 768,
			settings: {				
				centerPadding: '100px',
				slidesToShow: 2
			}
		},
		{
			breakpoint: 480,
			settings: {
				centerPadding: '100px',
				slidesToShow: 1
			}
		}
	]
});
// ------------------------------------------------

// ---------------- SLIDE WORK 2 ------------------
var autoplaySpeed = 3000;
var autoplayOn    = true;

var $slickRoot = $('.works-slider-2');

$slickRoot.on('init', function() {
    var $slickList = $slickRoot.find('.slick-list');

    $slickList.mouseenter(function() {
        autoplayOn = false;
    });
    $slickList.mouseleave(function() {
        autoplayOn = true;
    });

    window.setInterval(function() {
        if (!autoplayOn) return;
        $slickRoot.slick('slickPrev');
    }, autoplaySpeed);
});

$('.works-slider-2').slick({
 	arrows: false,
 	slidesToShow: 3,
 	centerMode: true,
	centerPadding: '100px',
	autoplay: false,	
	dots: false,
	infinite: true,	
	variableWidth: true,
	responsive: [
		{
			breakpoint: 768,
			settings: {				
				centerPadding: '100px',
				slidesToShow: 2
			}
		},
		{
			breakpoint: 480,
			settings: {
				centerPadding: '100px',
				slidesToShow: 1
			}
		}
	]
});
// ------------------------------------------------

// ---------------- SLIDE WORK 2 ------------------
$('.testimonials-carousel').slick({
	autoplay: false,
	slidesToShow: 1,
	dots: true,
	customPaging: function(slider, i) {
      
      return '<div class="testimonials-dots" id=' + i + "></div>";
    },
	arrows: false,
	variableWidth: false
});
// ------------------------------------------------

// ---------------- SMALL SCREENS -----------------
$('.nav-exit').click(function(){
	$('.nav-list').addClass('hide');
	$('.navbar-main').removeClass('hide');	
});

$('.nav-button').click(function(){
	$('.nav-list').removeClass('hide');
	$('.navbar-main').addClass('hide');	
});
// ------------------------------------------------

// ---------------- SMOOTH SCROLLING -----------------
$(document).ready(function(){
  // Add smooth scrolling to all links
  $("a").on('click', function(event) {

    // Make sure this.hash has a value before overriding default behavior
    if (this.hash !== "") {
      // Prevent default anchor click behavior
      event.preventDefault();

      // Store hash
      var hash = this.hash;

      // Using jQuery's animate() method to add smooth page scroll
      // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 800, function(){
   
        // Add hash (#) to URL when done scrolling (default click behavior)
        window.location.hash = hash;
      });
    } // End if
  });
});
// ------------------------------------------------
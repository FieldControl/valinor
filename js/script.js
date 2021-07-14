var slides = document.querySelectorAll('.clients__slider__slide');
var btns = document.querySelectorAll('.clients__slider__navigation__btn');
let currentSlide = 1;
let show = true;

const menuSection = document.querySelector(".navbar__menu")
const menuToggle = document.querySelector(".navbar__menubtn__menutoggler")

menuToggle.addEventListener("click", () => {
    menuSection.classList.toggle("on", show)
    show = !show;
})

function openNav() {
    document.getElementsByClassName(".navbar__menu").style.width = "250px";
}
  
function closeNav() {
    document.getElementsByClassName(".navbar__menu").style.width = "0";
}

var manualNav = function(manual){
    slides.forEach((slide) => {
        slide.classList.remove('active');

        btns.forEach((btn) => {
            btn.classList.remove('active');
        });
    })

    slides[manual].classList.add('active');
    btns[manual].classList.add('active');
}

btns.forEach((btn, i) => {
    btn.addEventListener("click", () => {
        manualNav(i);
        currentSlide = i;
    });
});

var repeat = function(activeClass){
    let active = document.getElementsByClassName('active');
    let i = 1;

    var repeater = () => {
        setTimeout(function(){
            [...active].forEach((activeSlide) => {
                activeSlide.classList.remove('active');
            })

            slides[i].classList.add('active');
            btns[i].classList.add('active');
            i++

            if(slides.length ==i){
                i = 0;                
            }
            if(i >= slides.length){
                return;
            }
            repeater();
        }, 10000);
    }
    repeater();
}
repeat();

$(document).ready(function(){
	$('.navbar__menubtn').click(function(){
		$(this).toggleClass('on');
	});
});
var slideIndex=1;showSlides(slideIndex);function plusSlides(n){showSlides(slideIndex+=n)}
function currentSlide(n){showSlides(slideIndex=n)}
function showSlides(n){var i;var slides=document.getElementsByClassName("mySlides");var dots=document.getElementsByClassName("dot");if(n>slides.length){slideIndex=1}
if(n<1){slideIndex=slides.length}
for(i=0;i<slides.length;i++){slides[i].style.display="none"}
for(i=0;i<dots.length;i++){dots[i].className=dots[i].className.replace(" active","")}
slides[slideIndex-1].style.display="block";dots[slideIndex-1].className+=" active"}
function topFunction(){document.body.scrollTop=0;document.documentElement.scrollTop=0}
function openNav(){document.getElementById("mySidebar").style.width="250px";document.getElementById("main").style.marginLeft="250px"}
function closeNav(){document.getElementById("mySidebar").style.width="0";document.getElementById("main").style.marginLeft="0"}
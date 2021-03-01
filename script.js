const glider = new Glider(document.querySelector('.glider'), {
  slidesToShow: 1,
  dots: '#dots',
  draggable: true,
  scrollLock: true,
});

function sliderAuto(slider, milliseconds) {
  slider.isLastSlide = function() {
    return slider.page >= slider.dots.childElementCount - 1;
  }
 
  var slide = function() {
    slider.slideTimeout = setTimeout(function() {
      function slideTo() {
        return slider.isLastSlide() ? 0 : slider.page + 1;
      }
 
      slider.scrollItem(slideTo(), true);
    }, milliseconds);
  }
 
  slider.ele.addEventListener('glider-animated', function(event) {
    window.clearInterval(slider.slideTimeout);
    slide();
  });
 
  slide();
 }

 sliderAuto(glider, 3000)

//  nav responsive
const navSlide = () => {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.navLinks');
  const navLinks = document.querySelectorAll('.navLinks li')

  burger.addEventListener('click', () => {
    nav.classList.toggle('navActive')

    navLinks.forEach((link, index) => {
      if (link.style.animation) {
        link.style.animation = '';
      } else {
        link.style.animation = `navLinksFade 0.5s ease forwards ${index / 7 + 0.5}s`;
      }
  
    });
  });
}


const app = () => {
  navSlide();

  sliderAuto(glider, 3000);
}

app();
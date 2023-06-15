
var timer;
var images = document.getElementsByClassName('responsive-image');
var buttons = document.getElementsByClassName('button-wrapper');

function Load() {

  Array.from(images).forEach(function (image, index) {
    image.style.opacity = 0;
    image.style.transition = 'opacity 1s';
    buttons[index].style.opacity = 0;
    buttons[index].style.transition = 'opacity 1s';

    // Adicionar eventos de mouse
    image.addEventListener('mouseenter', handleMouseEnter);
    image.addEventListener('mouseleave', handleMouseLeave);
  });

  setTimeout(function () {
    Array.from(images).forEach(function (image, index) {
      image.style.opacity = 1;
      buttons[index].style.opacity = 1;
    }, 300);

    var imageElements = Array.from(images);
    var currentIndex = 0;

    function toggleImages() {
      var currentImage = imageElements[currentIndex];
      var nextImage = imageElements[(currentIndex + 1) % imageElements.length];
      var currentButton = buttons[currentIndex];
      var nextButton = buttons[(currentIndex + 1) % imageElements.length];

      currentImage.style.opacity = 0.5;
      currentButton.style.opacity = 0.5;
      nextImage.style.opacity = 1;
      nextButton.style.opacity = 1;

      currentIndex = (currentIndex + 1) % imageElements.length;
    }

    timer = setInterval(toggleImages, 3000); // Altere o valor do intervalo conforme desejado (em milissegundos)
  }, 200);

  function handleMouseEnter(event) {
    var image = event.target;
    var imageElements = Array.from(document.getElementsByClassName('responsive-image'));
    var currentIndex = imageElements.indexOf(image);
    var nextImage = imageElements[(currentIndex + 1) % imageElements.length];
    var currentButton = document.getElementsByClassName('button-wrapper')[currentIndex];
    var nextButton = document.getElementsByClassName('button-wrapper')[(currentIndex + 1) % imageElements.length];

    image.style.opacity = 1;
    nextImage.style.opacity = 0.5;
    currentButton.style.opacity = 1;
    nextButton.style.opacity = 0.5;
  }

  function handleMouseLeave(event) {
    var image = event.target;
    image.style.opacity = 0.5;
  }
}

function Unload() {
  if (images) {
    Array.from(images).forEach(function (image) {
      image.removeEventListener('mouseenter', handleMouseEnter);
      image.removeEventListener('mouseleave', handleMouseLeave);
    });
  }
  clearInterval(timer);
}

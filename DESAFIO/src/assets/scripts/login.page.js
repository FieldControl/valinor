function loadCardContent() {
  var cardContent = document.querySelector('.card-content');

  // Defina a opacidade inicial como zero
  cardContent.style.opacity = '0';

  setTimeout(function () {
    // Aumente a opacidade gradualmente para 1
    cardContent.style.transition = 'opacity 1s';
    cardContent.style.opacity = '1';
  }, 1000);
}

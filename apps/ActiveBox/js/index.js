const Slider = {
  slider: document.getElementById('slider'),
  controller: document.getElementById('controller'),
  lastedIndex: 0,

  fadeOut () {
    this.slider.children[this.lastedIndex].children[1] = "fade 10s 1 forwards"
    this.slider.children[this.lastedIndex].className = "none"
  },

  fadeIn (index) {
    this.slider.children[index].className = ''
    this.slider.children[index].style.animation = 'fade reverse .3s 1 forwards'
  },

  resets (target, index) {
    target.setAttribute('data-active','true')
    this.controller.children[index].setAttribute('data-active','true')
    this.controller.children[this.lastedIndex].setAttribute('data-active','false')
    this.lastedIndex = index
  },

  changeSlider (target , index) {
    if (target.getAttribute('data-active') !== 'true') {
      this.fadeOut()

      this.fadeIn(index)

      this.resets(target, index)
    }
  }
}

document.querySelectorAll("#controller li").forEach((element, index) => {
  element.addEventListener("click", () => Slider.changeSlider(element, index))
})


window.SimpleSlide = class {
  constructor(t) {
    this.config = {
      slide: t.slide,
      auto: !t.auto || t.auto,
      nav: !!t.nav && t.nav,
      time: t.time ? t.time : 5e3
    },
      this.activeClass = "active",
      this.slide = document.querySelector(`[data-slide="${this.config.slide}"]`),
    this.slide && (this.items = [...this.slide.children], this.init())
  }

  activateSlide(t) {
    this.items.forEach(t => t.classList.remove(this.activeClass)),
      t
        ? (t.classList.add(this.activeClass), this.activateNav(t))
        : (this.items[0].classList.add(this.activeClass),
          this.activateNav(this.items[0]))
  }

  activateNav(t) {
    if (this.config.nav) {
      const i = this.items.indexOf(t), e = [...this.nav.children];
      e.forEach(t => t.classList.remove(this.activeClass)), e[i].classList.add(this.activeClass)
    }
  }

  rotateSlide() {
    const t = this.slide.querySelector(".active").nextElementSibling;
    this.activateSlide(t)
  }

  initAutoSlide() {
    clearInterval(this.autoSlide), this.autoSlide = setInterval(this.rotateSlide, this.config.time)
  }

  createNavigation() {
    this.nav = document.createElement("div"),
      this.nav.setAttribute("data-slide-nav", this.config.slide),
      this.items.forEach((t, i) => {
        this.nav.innerHTML += `<button data-slide-item="${i}">${i + 1}</button>`
      }),
      this.slide.after(this.nav)
  }

  handleNavigationEvent({currentTarget: t}) {
    const i = t.getAttribute("data-slide-item");
    this.activateSlide(this.items[i]), this.initAutoSlide()
  }

  bindEventsToNavigation() {
    [...this.nav.children].forEach(t => {
      t.addEventListener("click", this.handleNavigationEvent)
    })
  }

  initNavigation() {
    this.createNavigation(), this.bindEventsToNavigation()
  }

  bindFunctions() {
    this.rotateSlide = this.rotateSlide.bind(this), this.handleNavigationEvent = this.handleNavigationEvent.bind(this)
  }

  init() {
    this.bindFunctions(), this.config.auto && this.initAutoSlide(), this.config.nav && this.initNavigation(), this.activateSlide(this.items[0])
  }
}
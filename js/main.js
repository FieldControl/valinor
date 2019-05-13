// Bind querySelector function to $
const $ = document.querySelector.bind(document);

// Trigger when the entire page is ready
window.onload = function () {

    // Set prevent default to event
    function preventDefault(event) {
        event = event || window.event;
        if (event.preventDefault) event.preventDefault();
        event.returnValue = false;
    }

    // Change navbar style according to scroll position
    function navbarAdapt() {
        if (window.scrollY > 0) {
            $('.navbar').classList.add('scrolled');
            $('.navbar .content').classList.add('no-border');
        } else {
            $('.navbar').classList.remove('scrolled');
            $('.navbar .content').classList.remove('no-border');
        }
    }

    navbarAdapt();
    window.onscroll = navbarAdapt;

    $('.open-menu').onclick = function () {
        $('html').classList.add('menu-active');
        // Disable touch scroll for mobile
        $('html').addEventListener('touchmove', preventDefault, { passive: false });
    }

    $('.close-menu').onclick = function () {
        $('html').classList.remove('menu-active');
        // Active touch scroll for mobile
        $('html').removeEventListener('touchmove', preventDefault, { passive: false });
    }

    document.querySelectorAll('.menu-item a').forEach(item => {
        item.onclick = function () {
            $('html').classList.remove('menu-active');
            $('html').removeEventListener('touchmove', preventDefault, { passive: false });

        }
    });

    /* ====== Slide code ====== */

    // Adding eventListener to slide
    let slideEl = $('.slide');
    let startTouch;

    const photos = document.querySelectorAll('.photo-container .photo');
    const testimonials = document.querySelectorAll('.testimonial');
    const indicators = document.querySelectorAll('.fa-circle');
    const direction = { RIGHTTOLEFT: 1, LEFTTORIGHT: 0 };

    slideEl.addEventListener("touchstart", handleTouchStart, false);
    slideEl.addEventListener("touchend", handleTouchEnd, false);

    // Set left control to go to the previous slide
    $('.control.left').onclick = function () {
        updateActiveSlide([photos, testimonials, indicators], direction.LEFTTORIGHT);
    }

    // Set right control to go to the next slide
    $('.control.right').onclick = function () {
        updateActiveSlide([photos, testimonials, indicators], direction.RIGHTTOLEFT);
    }

    function handleTouchStart(event) {
        startTouch = event.touches;
    }

    function handleTouchEnd(event) {
        event.preventDefault();
        slide(startTouch, event.changedTouches, event);
    }

    function updateActiveSlide(arrayOfElements, moveDirection) {
        let indexOfActiveElement;

        arrayOfElements.forEach(nodeListOfElements => {
            // Get current active slide
            for (let entrie of nodeListOfElements.entries()) {
                if (entrie[1].classList.contains('active')) {
                    indexOfActiveElement = entrie[0];
                }
            }

            // Check if it's the first element
            if (indexOfActiveElement === 0) {
                nodeListOfElements.item(indexOfActiveElement).classList.remove('active');

                if (moveDirection === direction.RIGHTTOLEFT) { // Active next slide
                    nodeListOfElements.item(++indexOfActiveElement).classList.add('active');
                } else { // Active last slide
                    indexOfActiveElement = nodeListOfElements.length - 1;
                    nodeListOfElements.item(indexOfActiveElement).classList.add('active');
                }
            }
            // Check if it's the last element
            else if (indexOfActiveElement === nodeListOfElements.length - 1) {
                nodeListOfElements.item(indexOfActiveElement).classList.remove('active');

                if (moveDirection === direction.RIGHTTOLEFT) { // Active first slide
                    indexOfActiveElement = 0;
                    nodeListOfElements.item(indexOfActiveElement).classList.add('active');
                } else { // Active previous slide
                    nodeListOfElements.item(--indexOfActiveElement).classList.add('active');
                }
            }
            // Other elements
            else {
                nodeListOfElements.item(indexOfActiveElement).classList.remove('active');

                if (moveDirection === direction.RIGHTTOLEFT) { // Active next slide
                    nodeListOfElements.item(++indexOfActiveElement).classList.add('active');
                } else { // Active previous slide
                    nodeListOfElements.item(--indexOfActiveElement).classList.add('active');
                }
            }
        });
    }

    function slide(startPoint, endPoint) {
        let touchLenghtX = startPoint[0].screenX - endPoint[0].screenX;
        let touchLenghtY = startPoint[0].screenY - endPoint[0].screenY;
        let minTouchLenght = 50;

        // Horizontal touch move
        if (Math.abs(touchLenghtX) == 0 ||
            Math.abs(touchLenghtX) < minTouchLenght ||
            Math.abs(touchLenghtX) < Math.abs(touchLenghtY)) {
            return;
        }
        // Right to left touch move
        else if (startPoint[0].screenX - endPoint[0].screenX > 0) {
            updateActiveSlide([photos, testimonials, indicators], direction.RIGHTTOLEFT);
        }
        // Left to right touch move
        else {
            updateActiveSlide([photos, testimonials, indicators], direction.LEFTTORIGHT);
        }
    }
}
window.onscroll = function() { scrollFunction() };

function scrollFunction() {
    if (document.body.scrollTop > window.innerHeight / 10 || document.documentElement.scrollTop > window.innerHeight / 10) {
        document.getElementById("header").style.backgroundColor = "#2b2e4a";
    } else {
        document.getElementById("header").style.backgroundColor = "";
    }
}
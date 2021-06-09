document.getElementById("logo").onclick = function() {
    document.getElementById("html").style.overflowY = "visible";
    x.className = "header";
    return;
};

function menuFunction() {
    var x = document.getElementById("header");
    if (window.innerWidth > 1024) {
        return;
    } else
    if (x.className === "header") {
        x.className += "responsive";
        document.getElementById("html").style.overflowY = "hidden";

        document.getElementById("logo").onclick = function() {
            document.getElementById("html").style.overflowY = "visible";
            x.className = "header";
            return;
        };
    } else {
        x.className = "header";
        document.getElementById("html").style.overflowY = "visible";
    }
}
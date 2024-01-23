import './styles/style.css'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

let dashboardMenu = document.getElementById("dashboardMenu");
let personsMenu = document.getElementById("personsMenu");

function showDisplay(dashboard, persons) {
    document.querySelector(".dashboard").style.display = dashboard;
    document.querySelector(".persons").style.display = persons;
}

dashboardMenu.addEventListener("click", (e) => {
    e.preventDefault();
    showDisplay("block", "none");
    
})

personsMenu.addEventListener("click", (e) => {
    e.preventDefault();
    showDisplay("none", "block");
})
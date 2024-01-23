import '../styles/style.css';
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import api from "../config/axios";
import moment from 'moment';

let peopleCount = document.getElementById("people");
let speciesCount = document.getElementById("species");
let planetsCount = document.getElementById("planets");
let starshipsCount = document.getElementById("starships");

let bodyTable = document.getElementById("bodyTable");

function getPeople() {
    api.get("people").then((response) => {
        peopleCount.innerText = response.data.count;
    }).catch((error) => {
        console.log(error);
    })
}

function getSpecies() {
    api.get("species").then((response) => {
        speciesCount.innerText = response.data.count;
    }).catch((error) => {
        console.log(error);
    })
}

function getPlanets() {
    api.get("planets").then((response) => {
        planetsCount.innerText = response.data.count;
    }).catch((error) => {
        console.log(error);
    })
}

function getStarships() {
    api.get("starships").then((response) => {
        starshipsCount.innerText = response.data.count;
    }).catch((error) => {
        console.log(error);
    })
}

async function getFilms() {
    const response = await api.get("films/");
    let results = response.data.results

    for (let result of results) {
        let tr = document.createElement("tr");
        let date = moment(result.created);
        tr.innerHTML = `
            <td>${result.title}</td>
            <td>${date.format("DD/MM/YYYY")}</td>
            <td>${result.director}</td>
            <td>${result.episode_id}</td>
        `
        bodyTable.append(tr);
    }

}

function init() {
    getPeople();
    getPlanets();
    getStarships();
    getSpecies();
    getFilms();
}

init();
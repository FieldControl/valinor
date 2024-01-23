import '../styles/style.css';
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import api from "../config/axios";
import moment from 'moment';

let cardContainer = document.getElementById("cardContainer");

function createCard(name, height, weight, created) {
    const mainCard = document.createElement("div");
    const titleCard = document.createElement("div");
    const contentCard = document.createElement("div");

    mainCard.classList.add("card");
    mainCard.classList.add("person-card");
    mainCard.style.marginBottom = "10px";

    titleCard.classList.add("title-card");
    contentCard.classList.add("card-body");
    contentCard.classList.add("card-dinamic-content");

    const imgPerson = document.createElement("img");
    imgPerson.src = "./imgs/icons/jediBlack.svg";
    imgPerson.classList.add("icon-card");

    const cardTitle = document.createElement('h5');
    cardTitle.classList.add("card-dinamic-text-pattern")
    cardTitle.textContent = name;

    titleCard.appendChild(imgPerson);
    titleCard.appendChild(cardTitle);

    const altura = document.createElement('p');
    altura.textContent = `Altura: ${height}`;

    const peso = document.createElement('p');
    peso.textContent = `Peso: ${weight}kg`;

    const criacao = document.createElement('p');
    criacao.textContent = `Criação: ${created}`;

    contentCard.appendChild(altura);
    contentCard.appendChild(peso);
    contentCard.appendChild(criacao);

    mainCard.appendChild(titleCard);
    mainCard.appendChild(contentCard);
    
    cardContainer.appendChild(mainCard);
}

async function getPersonCards() {

    let response = await api.get("people/?page=1");
    console.log(response.data.results)

    let results = response.data.results;
    let date;
    let create
    for (let result of results) {
        if(result.created) {
            date = moment(result.created)
            create = date.format("DD/MM/YYYY");
        }
        createCard(result.name, result.height, result.mass, create);
    }
}

function init() {
    getPersonCards()
}

init();
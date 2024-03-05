const addCard = (columnId, title) => {
    const column = document.querySelector(`.column[data-id="${columnId}"]`);
    const cards = column.querySelector('.cards');
    const card = document.createElement('li');
    card.classList.add('card');
    card.innerHTML = `<p>${title}</p>`;
    cards.appendChild(card);
};

const moveCard = (cardId, columnId) => {
    const card = document.querySelector(`.card[data-id="${cardId}"]`);
    const currentColumn = card.parentNode;
    const newColumn = document.querySelector(`.column[data-id="${columnId}"]`);
    newColumn.querySelector('.cards').appendChild(card);
};

const getColumns = async () => {
    const response = await axios.get('/kanban/columns');
    return response.data;
};

const createCard = async (columnId, title) => {
    const response = await axios.post('/kanban/cards', {
        columnId,
        title,
    });
    return response.data;
};

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let cards = []; 


app.post("/cards", (req, res) => {
    const card = req.body;
    card.id = cards.length + 1;
    cards.push(card);
    res.status(201).json(card);
});


app.put("/cards/:id", (req, res) => {
    const { id } = req.params;
    const updatedCard = req.body;
    cards = cards.map(card => (card.id == id ? updatedCard : card));
    res.json(updatedCard);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));

app.use(express.static(path.join(__dirname, 'frontend/src')));

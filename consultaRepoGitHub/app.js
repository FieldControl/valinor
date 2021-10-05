const express = require("express");
const app = express();

app.use(express.static(__dirname + '\\assets'));

app.get('/', (req, res) => res.sendFile('menu.html', { root: './assets/html' }));
app.get('/search', (req, res) => res.sendFile('search.html', { root: './assets/html' }));

app.listen(2020, () => {
  console.log("listening on port 2020...");
});
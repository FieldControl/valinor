const express = require('express');
const app = express();
const router = require('./router/router');

const cors = require("cors");

app.use(cors());
app.use(router);
const PORT = 3333;
app.listen(PORT, ()=> console.log(`Server is running on Port ${PORT}`));
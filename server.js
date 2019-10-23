const express = require("express");
const mongoose = require('mongoose');
const requireDir = require('require-dir');

//Iniciando o App
const app = express();

//Iniciando o Data
mongoose.connect("mongodb://localhost:27017/nodeapi", {useNewUrlParser: true });  

requireDir('./src/models');

const Product = mongoose.model('Product');

app.get('/', (req, res) => {
   Product.create({ 
       title: 'ReactJs',
       description:'build page web with React',
       url: 'https://github.com/facebook/create-react-app'
    });

   return res.send('Hello!!!');
});



app.listen(3001);
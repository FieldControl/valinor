var express = require('express')
var app = express()
var consign = require('consign')
var bodyParser = require('body-parser')
require('dotenv').config({path: __dirname + '/.env'})

app.use(bodyParser.json());

consign({cwd: 'src'})
    .include('db')
    .then('dao')
    .then('routes')
    .into(app);

app.listen(3000, function(){
    console.log("Api iniciada na porta 3000")
})
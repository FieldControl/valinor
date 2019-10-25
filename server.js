import express from "express";
import mongoose from 'mongoose';
import requireDir from 'require-dir';
import cors from 'cors';

//Iniciando o App
const app = express();
app.use(express.json());
app.use(cors());

//Iniciando o Data
mongoose.connect("mongodb://localhost:27017/nodeapi", {useNewUrlParser: true });  

requireDir('./src/models');


//Rotas
app.use('/api', require('./src/routes'));


app.listen(3001);
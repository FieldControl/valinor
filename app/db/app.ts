
import db = require("./Contexto");
import Carro from "./Modelo/Carro";
import ICarro = require("./Iterface/ICarro");
import {Functions} from "../genericos/Functions";

export class App{

constructor(){}

public AddCarro(JsonCarro){
    return new Promise(function(resolve, reject){
        db.connectDataBase().then(()=>{
            console.log("AddCarro");

            let carroData : ICarro = JsonCarro;

            if (Functions.isNullOrEmpty(carroData.Marca)) 
              return reject('Marca do Carro não informada.');

            if (Functions.isNullOrEmpty(carroData.Modelo)) 
               return reject('Modelo do Carro não informado.');  
               
            if (Functions.isNullOrEmpty(carroData.Cor)) 
               return reject('Cor do Carro não informado.');  
               
            if (!Functions.isValidDate(carroData.AnoFabricacao) ) 
               return reject('Ano de Fabricação do Carro não informado.');   
               
            if (!Functions.isValidDate(carroData.AnoModelo)) 
              return  reject('Ano do Modelo do Carro não informado.');    
               
            if (Functions.isNullOrEmpty(carroData.QtdPortas) || (carroData.QtdPortas <= 0)) 
               return reject('Quantidade Portas do Carro não informado.');              

                 let carro = new Carro();
                 
                 carro.Marca = carroData.Marca;
                 carro.Modelo = carroData.Modelo;
                 carro.Cor = carroData.Cor;
                 carro.AnoFabricacao = carroData.AnoFabricacao;
                 carro.AnoModelo = carroData.AnoModelo;
                 carro.QtdPortas = carroData.QtdPortas;

                 carro.save(function(error, carro) {

                     if (error) {
                         console.error(error);
                         return reject(error);
                     }

                     resolve('OK');
                        
                 }); 


        }).catch(err => reject("Não foi possível conectar Banco de Dados."+err));
    });
}

public getCarro(id) {
    return new Promise(function(resolve, reject) {
        db.connectDataBase().then(() => {
            Carro.findById(id, (err, carro) => {
                if (err) return reject(err)
                return resolve(carro == undefined?{}:carro) ;
            });
          }).catch(err =>  reject("Não foi possível conectar Banco."));
    });
} 

public getListCarro(skip,limit, carro) {
    return new Promise(function(resolve, reject) {
        db.connectDataBase().then(() => {
        
            Carro.find((carro),(err, carros) => {
                if (err) return reject(err)
                return resolve(carros == undefined?[]:carros) ;
            }).skip(skip || 0).limit(limit || 0);
          }).catch(err =>  reject("Não foi possível conectar Banco."));
    });
} 

public putCarro(id, carro) {
    return new Promise(function(resolve, reject) {
        db.connectDataBase().then(() => {
            Carro.findByIdAndUpdate(id, carro,(err) => {
                if (err) return reject(err)
                return resolve('Alterado com sucesso');
            });
          }).catch(err =>  reject("Não foi possível conectar Banco."));
    });
} 

public patchCarro(id, carro) {
    return new Promise(function(resolve, reject) {
        db.connectDataBase().then(() => {
            Carro.findByIdAndUpdate(id, carro,(err) => {
                if (err) return reject(err)
                return resolve('Alterado com sucesso');
            });
          }).catch(err =>  reject("Não foi possível conectar Banco."));
    });
}

public deleteCarro(id) {
    return new Promise(function(resolve, reject) {
        db.connectDataBase().then(() => {
            Carro.findByIdAndRemove(id,(err) => {
                if (err) return reject(err)
                return resolve('Removido com sucesso');
            });
          }).catch(err =>  reject("Não foi possível conectar Banco."));
    });
}

}


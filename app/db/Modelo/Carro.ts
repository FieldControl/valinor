import mongoose from 'mongoose';
import ICarro from '../Iterface/ICarro';
 
var CarroSchema = new mongoose.Schema({

    Marca: {type : String},
    Modelo: {type : String},
    Cor: {type : String},
    AnoFabricacao:  { type: Date },
    AnoModelo:  { type: Date },
    QtdPortas: { type: Number }
    
});
 
var Carro = mongoose.model<ICarro>('Carro', CarroSchema, 'Carro');
 
export = Carro;
import mongoose from 'mongoose';

interface ICarro extends mongoose.Document {

    _id: mongoose.Types.ObjectId;
    Marca: string;
    Modelo: string;
    Cor: string;
    AnoFabricacao: Date;
    AnoModelo: Date;
    QtdPortas: Number;

}

export = ICarro;
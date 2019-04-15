import mongoose from 'mongoose';

 
export function connectDataBase(){
return  mongoose.connect('mongodb://localhost:27017/BancoCarSale', { useNewUrlParser: true });

} 
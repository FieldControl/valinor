import * as mongoose from 'mongoose';

export interface Card {
  tipo: string;
  dados: string[];
}

export const CardSchema = new mongoose.Schema({
  tipo: String,
  dados: [String],
});

export default mongoose.model<Card>('Card', CardSchema);

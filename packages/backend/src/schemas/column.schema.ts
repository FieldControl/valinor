import * as mongoose from 'mongoose';
import { Column } from 'src/interfaces/column.interface';

export const columnSchema = new mongoose.Schema<Column>(
  {
    _id_project: {
      type: String,
      required: [true, 'requer o id do projeto pertencente'],
    },
    title: {
      type: String,
      required: [true, 'requer um titulo para a coluna'],
    },
  },
  { timestamps: true },
);

import * as mongoose from 'mongoose';

export const columnSchema = new mongoose.Schema(
  {
    _id_project: String,
    title: String,
  },
  { timestamps: true },
);

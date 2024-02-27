import * as mongoose from 'mongoose';

export const taskSchema = new mongoose.Schema({
  _id_project: String,
  _id_column: String,
  title: String,
  description: String,
  archived: Boolean,
  createdDate: { type: Date, default: Date.now },
});

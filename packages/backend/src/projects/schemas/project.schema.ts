import * as mongoose from 'mongoose';

export const ProjectSchema = new mongoose.Schema({
  title: String,
  columns: Array,
  createdDate: { type: Date, default: Date.now },
});

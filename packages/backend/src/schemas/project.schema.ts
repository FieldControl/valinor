import * as mongoose from 'mongoose';
import { Project } from 'src/interfaces/project.interface';

export const ProjectSchema = new mongoose.Schema<Project>({
  title: String,
  createdDate: { type: Date, default: Date.now },
});

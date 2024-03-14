import * as mongoose from 'mongoose';
import { Project } from 'src/interfaces/project.interface';

export const ProjectSchema = new mongoose.Schema<Project>(
  {
    title: {
      type: String,
      required: [true, 'requer um titulo para o projeto'],
    },
  },
  { timestamps: true },
);

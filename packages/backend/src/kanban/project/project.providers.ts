import { Mongoose } from 'mongoose';
import { ProjectSchema } from '../../schemas/project.schema';

export const projectsProviders = [
  {
    provide: 'PROJECT_MODEL',
    useFactory: (mongoose: Mongoose) =>
      mongoose.model('Project', ProjectSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];

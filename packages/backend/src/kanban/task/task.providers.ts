import { Mongoose } from 'mongoose';
import { archiveSchema } from 'src/schemas/archive.schema';
import { taskSchema } from 'src/schemas/task.schema';

export const taskProviders = [
  {
    provide: 'TASK_MODEL',
    useFactory: (mongoose: Mongoose) => mongoose.model('Task', taskSchema),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'ARCHIVE_MODEL',
    useFactory: (mongoose: Mongoose) =>
      mongoose.model('ARCHIVE', archiveSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];

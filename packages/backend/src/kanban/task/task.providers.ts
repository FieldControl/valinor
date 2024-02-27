import { Mongoose } from 'mongoose';
import { taskSchema } from 'src/schemas/task.schema';

export const taskProviders = [
  {
    provide: 'TASK_MODEL',
    useFactory: (mongoose: Mongoose) => mongoose.model('Task', taskSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];

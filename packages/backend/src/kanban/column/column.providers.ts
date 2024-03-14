import { Mongoose } from 'mongoose';
import { columnSchema } from 'src/schemas/column.schema';

export const columnProviders = [
  {
    provide: 'COLUMN_MODEL',
    useFactory: (mongoose: Mongoose) => mongoose.model('Column', columnSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];

import { ConfigModule } from '@nestjs/config';
import dbConfiguration from './src/config/db.config';

ConfigModule.forRoot({
  isGlobal: true,
  load: [dbConfiguration],
});

export default dbConfiguration();


import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: process.env.DB_TYPE as 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10), 
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: process.env.DB_SYNCHRONIZE === 'true', 
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
});

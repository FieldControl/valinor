import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const ormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '123456',
  database: 'field',
  entities: ['dist/**/*.entity.js'],
  synchronize: true, 
  migrations: ['dist/migration/**/*.js'],
};

export default ormConfig;

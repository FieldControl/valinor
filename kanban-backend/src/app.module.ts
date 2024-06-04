import { Module } from '@nestjs/common';
     import { TypeOrmModule } from '@nestjs/typeorm';
     import { TaskModule } from './task/task.module';


     @Module({
       imports: [
         TypeOrmModule.forRoot({
           type: 'mysql',
           host: 'localhost',
           port: 3306,
           username: 'root',
           password: '12345',
           database: 'teste',
           entities: [__dirname + '/**/../typeorm/entities/*.ts'],
           synchronize: true,
         }),
         TaskModule,
       ],
       
     })
     export class AppModule {}
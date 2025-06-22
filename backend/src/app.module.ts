import { Module } from '@nestjs/common';
import { TypeOrmModule} from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TaskModule } from './task/task.module';

@Module({
  imports: [
  TypeOrmModule.forRoot({ // Configuração do TypeORM para conectar ao banco de dados SQLite
    // Certifique-se de que o pacote @nestjs/typeorm e typeorm estejam instalados
    // Você pode instalar com: npm install @nestjs/typeorm typeorm sqlite3
    type: 'sqlite',
    database: 'db.sqlite',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],  
    synchronize: true, //Em produção, deve ser false
    logging: true, // Habilita o log de consultas SQL
    
  }),
  TaskModule, // Importa o módulo TaskModule
  ],
  controllers: [AppController], 
  providers: [AppService],
  
})
export class AppModule {}

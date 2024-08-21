//importação padrão na criação de aplicações NestJS.
import { Module } from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';

//importando Modulo para manipular o DataBase e Entidade referente ao endpoint
import { Columns } from './entities/column.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [ColumnController],
  providers: [ColumnService, UserService],
  imports: [TypeOrmModule.forFeature([Columns, User]), UserModule],
})
export class ColumnModule {}

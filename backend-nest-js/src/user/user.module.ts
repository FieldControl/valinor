//importação padrão na criação de aplicações NestJS.
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';

//importando Modulo para manipular o DataBase e Entidade referente ao endipoint
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    TypeOrmModule.forFeature([User])
  ]
})
export class UserModule {}

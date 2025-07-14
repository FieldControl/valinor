// ARQUIVO: src/users/users.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';

/**
 * @Module() organiza o código relacionado à gestão de utilizadores.
 */
@Module({
  // 'imports': Disponibiliza o repositório da entidade 'User' para este módulo.
  // O 'TypeOrmModule.forFeature([User])' permite que o UsersService possa injetar o Repository<User>.
  imports: [TypeOrmModule.forFeature([User])],

  // 'providers': Regista os serviços que pertencem a este módulo.
  providers: [UsersService],

  // 'exports': Torna os serviços deste módulo (neste caso, o UsersService)
  // disponíveis para outros módulos que importem o UsersModule.
  // É por causa desta linha que o AuthModule consegue usar o UsersService.
  exports: [UsersService],

  controllers: [UsersController],
})
export class UsersModule {}
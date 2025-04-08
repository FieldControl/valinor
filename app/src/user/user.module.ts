import { Module } from '@nestjs/common'; // Importa o Module, que é utilizado para estruturar a aplicação em escopos.
import { UserService } from './user.service'; // Serviço que contém a lógica de negócios para usuários.
import { UserController } from './user.controller'; // Controlador que define as rotas HTTP para usuários. 
import { TypeOrmModule } from '@nestjs/typeorm';// Importa o TypeOrmModule, necessário para gerenciar a entidade User.
import { User } from './entities/user.entity'; // A entidade do banco de dados que representa um usuário.

@Module({
  controllers: [UserController], // Declara o UserController para lidar com as requisições HTTP
  providers: [UserService], // Declara o UserService, que contém a lógica de manipulação dos dados.
  imports: [TypeOrmModule.forFeature([User])], // Importa a entidade User, permitindo que o TypeORM gerencie essa tabela no banco.
  exports: [UserService], // Permite que outros módulos utilizem o UserService.
})
export class UserModule {}

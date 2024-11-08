import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  controllers: [UserController],
  providers: [UserService],
  /* O trecho `imports: [TypeOrmModule.forFeature([User])]` conecta a entidade `User` ao banco de dados 
dentro deste módulo (`UserModule`). Isso permite que a gente use o `UserService` para acessar e 
manipular dados da tabela `User` no banco de dados (como salvar, buscar, atualizar ou deletar usuários).*/
  imports: [TypeOrmModule.forFeature([User])],
  exports: [UserService],
})
export class UserModule {}

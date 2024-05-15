import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { UsuarioService } from 'src/usuario/usuario.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsuarioService],
  imports: [
  TypeOrmModule.forFeature([Usuario]),
],
})
export class AuthModule {}
 
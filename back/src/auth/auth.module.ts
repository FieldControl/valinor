import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsuarioModule } from 'src/usuario/usuario.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UsuarioModule,
    TypeOrmModule.forFeature([Usuario]),
  JwtModule.register({
    global: true,
    secret: 'secretKey',
    signOptions: { expiresIn: '3h' },
  }),],
})
export class AuthModule {}

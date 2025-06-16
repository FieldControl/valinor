// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importe TypeOrmModule
import { User } from '../entidades/user.entity'; // Importe a entidade User
import { JwtModule } from '@nestjs/jwt'; // Importe JwtModule
import { PassportModule } from '@nestjs/passport'; // Importe PassportModule
import { JwtStrategy } from './jwt-strategy'; // Importe JwtStrategy

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // <<--- ESTA LINHA É CRUCIAL E PROVAVELMENTE ESTÁ FALTANDO OU INCORRETA
    PassportModule,
    JwtModule.register({
      secret: 'LUVAS', // Sua chave secreta aqui
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

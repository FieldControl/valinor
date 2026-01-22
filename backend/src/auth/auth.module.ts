import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module'; // Importa o UsersModule para buscar pessoas no banco
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [
    UsersModule, // <--- Conecta com o módulo de usuários que criamos antes
    PassportModule,
    JwtModule.register({
      secret: 'MINHA_CHAVE_SECRETA_SUPER_SEGURA_123', // Em um app real, isso iria num arquivo .env
      signOptions: { expiresIn: '1d' }, // O token vale por 1 dia
    }),
  ],
  providers: [AuthService, AuthResolver],
  exports: [AuthService],
})
export class AuthModule {}
// ARQUIVO: src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

/**
 * @Module() organiza toda a lógica relacionada à autenticação.
 * Ele importa outros módulos e registra os controllers e serviços
 * que pertencem a esta funcionalidade.
 */
@Module({
  // 'imports': Lista os módulos externos cujos recursos (como serviços)
  // queremos usar dentro do AuthModule.
  imports: [
    // Importa o UsersModule para que o AuthService possa usar o UsersService
    // para encontrar e criar utilizadores no banco de dados.
    UsersModule,

    // Importa o PassportModule, a base para as estratégias de autenticação no NestJS.
    PassportModule,
    
    // Configura o JwtModule, que é responsável por criar e validar os tokens JWT.
    JwtModule.register({
      // A chave secreta é usada para assinar os tokens, garantindo sua integridade.
      // IMPORTANTE: Em produção, esta chave NUNCA deve estar no código.
      // Ela deve ser carregada de uma variável de ambiente (ex: process.env.JWT_SECRET).
      secret: 'qwervtyuiopasqdsfghjklçzxcvbfGABRIELFERNANDESRIGUETTOnmmdvgnbvcsxzçlkjhgfdsdapofiuytrewq',
      
      // Define o tempo de vida padrão para os tokens gerados.
      signOptions: { expiresIn: '1h' }, // Formato: '1h' (1 hora), '7d' (7 dias), '3600s' (3600 segundos)
    }),
  ],
  
  // 'controllers': Regista os controllers que pertencem a este módulo.
  // O AuthController define os endpoints da API (ex: /auth/login).
  controllers: [AuthController],

  // 'providers': Regista os serviços e outras classes que podem ser injetadas.
  // - AuthService: Contém a lógica de negócio para login e registo.
  // - JwtStrategy: Contém a lógica para validar os tokens JWT.
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
import { Module } from '@nestjs/common'; // Importando o módulo principal do NestJS

import { AuthController } from './auth.controller'; // Importando o controlador de autenticação
import { AuthService } from './auth.service'; // Importando o serviço de autenticação

import { TypeOrmModule } from '@nestjs/typeorm'; // Importando o módulo TypeORM para integração com o banco de dados
import { User } from 'src/user/entities/user.entity'; // Importando a entidade de usuário
import { JwtModule } from '@nestjs/jwt'; // Importando o módulo JWT para autenticação baseada em tokens
import { UserModule } from 'src/user/user.module'; // Importando o módulo de usuário

@Module({ // Definindo o módulo de autenticação
  controllers: [AuthController], // Registrando o controlador de autenticação
  providers: [AuthService], // Registrando o serviço de autenticação
  imports: [ // Importando os módulos necessários
    UserModule, // Importando o módulo de usuário
    TypeOrmModule.forFeature([User]), // Registrando a entidade de usuário com o TypeORM, utilizando forFeature para injeção de dependência
    JwtModule.register({ // Registrando o módulo JWT
      global: true, // Tornando o módulo global para que possa ser utilizado em outros módulos sem necessidade de importação
      secret: 'secretKey', // Chave secreta para assinatura dos tokens JWT (deve ser mantida em segredo e não exposta no código)
      signOptions: { expiresIn: '3h' }, // Definindo o tempo de expiração do token JWT (3 horas neste caso)
    }),
  ],
})

export class AuthModule {} // Exportando o módulo de autenticação para ser utilizado em outros módulos

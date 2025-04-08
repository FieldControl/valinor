import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'; // Importando os decorators e classes de exceção do NestJS

import * as bcrypt from 'bcrypt'; // Importando o bcrypt para hash de senhas

import { InjectRepository } from '@nestjs/typeorm'; // Importando o decorator para injeção de repositório do TypeORM
import { User } from 'src/user/entities/user.entity'; // Importando a entidade de usuário
import { Repository } from 'typeorm'; // Importando o repositório do TypeORM para manipulação de dados
import { LoginDto } from './dto/login.dto'; // Importando o DTO de login
import { JwtService } from '@nestjs/jwt'; // Importando o serviço JWT para geração de tokens

@Injectable() // Decorator que indica que esta classe pode ser injetada como dependência
export class AuthService { // Classe de serviço de autenticação

  // Injetando o repositório de usuários e o serviço JWT no construtor
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) { // Método assíncrono para realizar o login do usuário

    // Verifica se o usuário existe no banco de dados com o email fornecido
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) { // Se o usuário não for encontrado, lança uma exceção de não encontrado
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!bcrypt.compareSync(loginDto.password, user.password)) { // Verifica se a senha fornecida corresponde à senha armazenada no banco de dados
      throw new UnauthorizedException('Informações de login inválidas');
    }

    const payload = { email: user.email, id: user.id }; // Cria o payload do token com o email e id do usuário

    return {
      accessToken: await this.jwtService.signAsync(payload), // Gera o token JWT assíncronamente, assinado com o payload e a chave secreta definida no módulo JWT
    };
  }
}

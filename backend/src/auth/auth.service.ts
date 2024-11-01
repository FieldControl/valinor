import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';  // Importa a entidade User
import { Repository } from 'typeorm'; // Importa o repositório do TypeORM
import { LoginDto } from './dto/login.dto'; // Importa o DTO para login
import { JwtService } from '@nestjs/jwt'; // Importa o serviço JWT do NestJS
import * as bcrypt from 'bcrypt'; // Importa o bcrypt para hashing de senhas

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) // Injeta o repositório do usuário
    private userRepository: Repository<User>,
    private jwtService: JwtService, // Injeta o serviço de JWT
  ) {}

  // Método para realizar o login do usuário
  async login(loginDto: LoginDto) {
    // Busca o usuário pelo email fornecido no LoginDto
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    // Verifica se o usuário foi encontrado
    if (!user) {
      throw new UnauthorizedException('Invalid login details');
    }

    // Verifica se a senha fornecida é válida
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid login details');
    }

    // Cria um payload para o token JWT, incluindo o email e o id do usuário
    const payload = { email: user.email, id: user.id };

    // Retorna o token de acesso assinado, com um tempo de expiração configurado
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '1h', // Define o tempo de expiração do token
      }),
    };
  }
}

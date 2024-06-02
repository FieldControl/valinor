import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'; // Importa os decoradores e exceções necessárias do Nest.js
import { InjectRepository } from '@nestjs/typeorm'; // Importa o decorador para injetar o repositório
import { User } from 'src/user/entities/user.entity'; // Importa a entidade de usuário
import { Repository } from 'typeorm'; // Importa o tipo Repository do TypeORM
import { LoginDto } from './dto/login.dto'; // Importa o DTO para informações de login
import { JwtService } from '@nestjs/jwt'; // Importa o serviço JWT do Nest.js
import * as bcrypt from 'bcrypt'; // Importa a biblioteca bcrypt para criptografia de senha

@Injectable() // Define a classe como um serviço injetável
export class AuthService {
  constructor(
    @InjectRepository(User) // Injeta o repositório de usuários
    private userRepository: Repository<User>,
    private jwtService: JwtService, // Injeta o serviço JWT
  ) {}

  async login(loginDto: LoginDto) { // Método para autenticar um usuário
    const user = await this.userRepository.findOne({ // Busca o usuário pelo e-mail no banco de dados
      where: { email: loginDto.email },
    });

    if (!user) { // Se o usuário não for encontrado
      throw new NotFoundException('User not found'); // Lança uma exceção informando que o usuário não foi encontrado
    }

    if (!bcrypt.compareSync(loginDto.password, user.password)) { // Compara a senha fornecida com a senha armazenada no banco de dados
      throw new UnauthorizedException('Invalid login details'); // Se as senhas não coincidirem, lança uma exceção informando que os detalhes de login são inválidos
    }

    const payload = { email: user.email, id: user.id }; // Cria um payload para o token JWT contendo o e-mail e o ID do usuário

    return { // Retorna um objeto contendo o token de acesso JWT
      accessToken: await this.jwtService.signAsync(payload), // Assina o token JWT usando o serviço JWT
    };
  }
}

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }



  //  Realiza o login de um usuário.

  //   @param loginDto - Objeto contendo as credenciais de login do usuário.
  //   @returns Um objeto contendo o token de acesso JWT.
  //   @throws NotFoundException - Se o usuário não for encontrado.
  //   @throws UnauthorizedException - Se a senha estiver incorreta.

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new NotFoundException('Usuário Não encontrado');
    }

    if (!bcrypt.compareSync(loginDto.senha, user.senha)) {
      throw new UnauthorizedException('Senha ou Usuário inválidos');
    }

    const payload = { email: user.email, id: user.id };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}

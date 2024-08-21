import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../usuario/entities/usuario.entity'; 
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AutenticarService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    if (!bcrypt.compareSync(loginDto.senha, usuario.senha)) {
      throw new UnauthorizedException('Detalhes de login invalidos');
    }

    const payload = { email: usuario.email, id: usuario.id };

    return {
      acessToken: await this.jwtService.signAsync(payload),
    };
  }
}

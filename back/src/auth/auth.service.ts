import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private jwtService: JwtService,
  ){}

  async login(loginDto: LoginDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    if (!bcrypt.compareSync(loginDto.senha, usuario.senha)) {
      throw new UnauthorizedException('Login Invalido');
    }

    const payload = { email: usuario.email, id: usuario.id };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

}

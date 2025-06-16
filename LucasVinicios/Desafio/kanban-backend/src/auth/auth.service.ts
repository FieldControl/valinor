// src/auth/auth.service.ts (BACKEND - NESTJS)
import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { email, password } = authCredentialsDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.usersRepository.create({ email, password: hashedPassword });

    try {
      await this.usersRepository.save(user);
    } catch (error: any) { // Cast para 'any' para evitar 'Unsafe member access'
      if (error.code === 'SQLITE_CONSTRAINT' || error.errno === 19) {
        throw new ConflictException('Email já cadastrado.');
      } else {
        console.error('Erro inesperado ao cadastrar usuário (backend):', error);
        throw new BadRequestException('Erro ao cadastrar usuário.');
      }
    }
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    const { email, password } = authCredentialsDto;
    const user = await this.usersRepository.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { email: user.email, sub: user.id };
      const accessToken: string = await this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
  }
}
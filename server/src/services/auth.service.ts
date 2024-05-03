import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { LoginDto } from '../dtos//login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;

    // Verifica se o usuário existe
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verifica se a senha está correta
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gera token de acesso
    const accessToken = this.jwtService.sign({ userId: user.id });

    return { accessToken };
  }

  async register(registerDto: RegisterDto): Promise<void> {
    const { email, password } = registerDto;

    // Verifica se o usuário já existe
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('Usuário já cadastrado');
    }

    // Cria novo usuário
    const newUser = new UserEntity();
    newUser.email = email;
    newUser.password = password;

    // Salva usuário no banco de dados
    await this.userRepository.save(newUser);
  }

  /*
  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;

    // Verificar se o usuário existe
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar se a senha está correta
    const isPasswordValid = await user.comparePasswordCrypt(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar token de acesso
    const accessToken = this.jwtService.sign({ userId: user.id });

    return { accessToken };
  }
  */
}

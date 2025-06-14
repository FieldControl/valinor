import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginUserDto } from './DTO/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private jwtService: JwtService) { }

    async login(model: LoginUserDto) {
        const { email, password } = model;

        const user = await this.userRepository.findOne({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            throw new NotFoundException('Credenciais inválidas');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        console.log('ta aqui');

        const payload = { email: user.email, id: user.id };
        return {
            data: { token: await this.jwtService.signAsync(payload), },
            message: 'Usuário autenticado com sucesso',
        };

    }

}

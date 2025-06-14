import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/auth/DTO/create-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }

    async create(user: CreateUserDto) {
        if (!user.email || !user.password) {
            throw new Error('Email e senha são obrigatórios');
        }

        const existingUser = await this.userRepository.findOne({
            where: { email: user.email.toLowerCase() },
        });

        if (existingUser) {
            throw new UnauthorizedException('Usuário com este email já existe');
        }

        const newUser = this.userRepository.create(user);
        return this.userRepository.save(newUser);
    }
}

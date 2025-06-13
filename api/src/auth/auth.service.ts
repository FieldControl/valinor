import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginUserDto } from './DTO/login-user.dto';

@Injectable()
export class AuthService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }

    async login(model: LoginUserDto) {
        const { email, password } = model;

        const user = await this.userRepository.findOne({
            where: { email: email.toLowerCase()},
            select: ['id', 'email', 'password']
        });

       
    }

}

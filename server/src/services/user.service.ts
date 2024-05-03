import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async getAllUsers(): Promise<UserEntity[]> {
        return this.userRepository.find();
    }

    async getUserById(id: number): Promise<UserEntity> {
        return this.userRepository.findOne({ where: { id } });
    }

    async getUserByEmail(email: string): Promise<UserEntity> {
        return this.userRepository.findOne({ where: { email } });
    }

    async createUser(user: UserEntity): Promise<UserEntity> {
        return this.userRepository.save(user);
    }

    async updateUser(id: number, user: UserEntity): Promise<UserEntity> {
        await this.userRepository.update(id, user);
        return this.userRepository.findOne({ where: { id } });
    }

    async deleteUser(id: number): Promise<void> {
        await this.userRepository.delete(id);
    }
}

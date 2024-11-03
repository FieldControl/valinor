import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = hashedPassword;
    return await this.usersRepository.insert(createUserDto);
  }

  async findAll() {
    return await this.usersRepository.find();
  }
  async findOneByUsername(username: string) {
    return await this.usersRepository.findOne({where: {username, status: 1}});
  }
  async findOne(id: number) {
    return await this.usersRepository.findOne({where: {id, status: 1}});
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.usersRepository.update(id, updateUserDto);
  }

  async remove(id: number) {
    return await this.usersRepository.update(id, {status: 0});
  }
}

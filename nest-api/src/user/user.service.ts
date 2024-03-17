import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAllUsers(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users;
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createUser(data: CreateUserInput): Promise<User> {
    const email = data.email;
    const checkEmailExists = await this.userRepository.findOne({
      where: { email },
    });

    if (checkEmailExists) {
      throw new NotFoundException('E-mail already registered.');
    }

    const user = this.userRepository.create(data);
    const userSaved = await this.userRepository.save(user);

    if (!userSaved) {
      throw new InternalServerErrorException('Error when creating a new user.');
    }

    return userSaved;
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    const user = await this.findUserById(id);

    const updatedUser = { ...user, ...data };

    const userUpdated = await this.userRepository.save(updatedUser);
    // await this.userRepository.update(user, { ...data });
    // const userUpdated = { ...user, ...data };

    return userUpdated;
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.findUserById(id);

    const deleted = await this.userRepository.remove(user);

    if (deleted) {
      return true;
    }
    return false;
  }
}

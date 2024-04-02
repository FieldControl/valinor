import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from 'src/auth/dto/register.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  create(createUserDto: RegisterDto) {
    const user = new User();
    user.email = createUserDto.email;
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;
    user.password = createUserDto.password;
    return this.userRepository.save(user);
  }

  findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  async isConnectedToBoard(id: number, boardId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
        boards: {
          id: boardId,
        },
      },
      relations: ['boards'],
    });

    if (!user) {
      throw new UnauthorizedException('You are not a part of this board.');
    }

    return true;
  }

  async isConnectedToSwimlane(id: number, swimlaneId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
        boards: {
          swimlanes: {
            id: swimlaneId,
          },
        },
      },
      relations: ['boards', 'boards.swimlanes'],
    });

    if (!user) {
      throw new UnauthorizedException('You are not a part of this board.');
    }

    return true;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, {
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
    });
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }
}

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
    user.emailUser = createUserDto.emailUser;
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;
    user.passwordUser = createUserDto.passwordUser;
    return this.userRepository.save(user);
  }

  findOne(idUser: number) {
    return this.userRepository.findOneBy({ idUser });
  }

  async isConnectedToBoard(idUser: number, boardId: number) {
    const user = await this.userRepository.findOne({
      where: {
        idUser,
        boards: {
          idBoard: boardId,
        },
      },
      relations: ['boards'],
    });

    if (!user) {
      throw new UnauthorizedException('você não faz parte desse quadro.');
    }
    return true;
  }

  async isConnectedToSwimlane(idUser: number, swimlaneCod: number) {
    const user = await this.userRepository.findOne({
      where: {
        idUser,
        boards: {
          swimlanes: {
            idSwimlane: swimlaneCod,
          },
        },
      },
      relations: ['boards', 'boards.swimlanes'],
    });

    if (!user) {
      throw new UnauthorizedException('você não faz parte desse quadro.');
    }

    return true;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, {
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
    });
  }

  remove(idUser: number) {
    return this.userRepository.delete(idUser);
  }
}

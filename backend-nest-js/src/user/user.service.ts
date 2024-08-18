import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {

  //importando o Repositorio contendo a coluna User do DataBase SQL.
  constructor(@InjectRepository(User)private userRepository: Repository<User>,){}

  //registrando novo usuario no banco de dados.
  RegisterNewUser(createUserDto: CreateUserDto) {
    const user = new User();
    user.email = createUserDto.email;
    user.firstname = createUserDto.firstname;
    user.lastname = createUserDto.lastname;
    user.password = createUserDto.password;
    return this.userRepository.save(user);
  }

  //correlação dos quadros com o usuario.
  findAllUsersByBoardId(boardId: number) {
    return this.userRepository.find({
      where: {
        boards: {id : boardId},
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

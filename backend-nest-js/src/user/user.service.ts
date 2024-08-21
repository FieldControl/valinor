//confiiguração padrão, service injetavel
import { Injectable } from '@nestjs/common';

//arquivos DTO dos usuarios
import { UpdateUserDto } from './dto/update-user.dto';

//Database
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { registerDto } from 'src/authenticate/dto/register.dto';


@Injectable()
export class UserService {

  //importando o Repositorio contendo a coluna User do DataBase SQL.
  constructor(@InjectRepository(User)private userRepository: Repository<User>,) {  }

  //registrando novo usuario no banco de dados.
  RegisterNewUser(createUserDto: registerDto) {
    const user = new User();
    user.email = createUserDto.email;
    user.firstname = createUserDto.firstname;
    user.lastname = createUserDto.lastname;
    user.password = createUserDto.password;
    return this.userRepository.save(user);
  }

  //buscando usuario unico
  findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  isConnectedToBoard(boardId: number, id: number) {
    return this.userRepository.findOneBy({ id, boards: {
      id: boardId,
    } });
  }

  //atualizando primeiro nome e sobre nome do usuário
  UpdateUserInformation(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, {
      firstname: updateUserDto.firstname,
      lastname: updateUserDto.lastname,
    });
  }


  remove(id: number) {
    return this.userRepository.delete(id);
  }
}

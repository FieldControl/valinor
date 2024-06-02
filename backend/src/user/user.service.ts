import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto'; // Importa o DTO para atualização do usuário
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity'; // Importa a entidade do usuário
import { Repository } from 'typeorm';
import { RegisterDto } from 'src/auth/dto/register.dto'; // Importa o DTO para registro do usuário

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>, // Injeta o repositório do usuário
  ) {}

  // Método para criar um novo usuário
  create(createUserDto: RegisterDto) {
    const user = new User(); // Cria uma nova instância de usuário
    // Define os campos do usuário com base nos dados do DTO de registro
    user.email = createUserDto.email;
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;
    user.password = createUserDto.password;
    return this.userRepository.save(user); // Salva o usuário no banco de dados
  }

  // Método para buscar um usuário pelo ID
  findOne(id: number) {
    return this.userRepository.findOneBy({ id }); // Retorna o usuário encontrado
  }

  // Método para verificar se um usuário está associado a um quadro específico
  async isConnectedToBoard(id: number, boardId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
        boards: {
          id: boardId,
        },
      },
      relations: ['boards'], // Inclui as relações de quadros do usuário
    });

    // Se o usuário não estiver associado ao quadro, lança uma exceção de não autorizado
    if (!user) {
      throw new UnauthorizedException('You are not a part of this board.');
    }

    return true; // Retorna verdadeiro se o usuário estiver associado ao quadro
  }

  // Método para verificar se um usuário está associado a uma swimlane específica
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
      relations: ['boards', 'boards.swimlanes'], // Inclui as relações de quadros e swimlanes do usuário
    });

    // Se o usuário não estiver associado à swimlane, lança uma exceção de não autorizado
    if (!user) {
      throw new UnauthorizedException('You are not a part of this board.');
    }

    return true; // Retorna verdadeiro se o usuário estiver associado à swimlane
  }

  // Método para atualizar informações do usuário
  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, {
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
    }); // Atualiza o usuário com base nos dados do DTO de atualização
  }

  // Método para remover um usuário pelo ID
  remove(id: number) {
    return this.userRepository.delete(id); // Remove o usuário do banco de dados
  }
}

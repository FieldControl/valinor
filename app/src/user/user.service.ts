import { Injectable, UnauthorizedException } from '@nestjs/common'; // Importa os decorators e classes do NestJS
import { UpdateUserDto } from './dto/update-user.dto'; // Importa o DTO de atualização de usuário
import { InjectRepository } from '@nestjs/typeorm'; // Importa o decorator para injeção de repositório
import { User } from './entities/user.entity'; // Importa a entidade User
import { Repository } from 'typeorm'; // Importa a classe Repository do TypeORM
import { RegisterDto } from 'src/auth/dto/register.dto'; // Importa o DTO de registro de usuário

@Injectable() // Decorator que indica que a classe pode ser injetada como dependência
export class UserService {
  // Injeção de dependência do repositório de usuários
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  create(createUserDto: RegisterDto) { // Método para criar um novo usuário
    const user = new User(); // Cria uma nova instância de User
    user.email = createUserDto.email; // Atribui o email do DTO ao usuário
    user.firstName = createUserDto.firstName; // Atribui o primeiro nome do DTO ao usuário
    user.lastName = createUserDto.lastName; // Atribui o sobrenome do DTO ao usuário
    user.password = createUserDto.password; // Atribui a senha do DTO ao usuário
    return this.userRepository.save(user); // Salva o usuário no banco de dados
  }

  findOne(id: number) { // Método para encontrar um usuário pelo ID
    return this.userRepository.findOneBy({ id }); // Busca o usuário pelo ID
  }

  async isConnectedToBoard(id: number, boardId: number) { // Método para verificar se o usuário está conectado a um quadro
    const user = await this.userRepository.findOne({ // Busca o usuário
      // Verifica se o usuário está conectado ao quadro e se o quadro contém o ID do quadro passado como parâmetro
      where: {
        id,
        boards: {
          id: boardId,
        },
      },
      relations: ['boards'],
    });

    if (!user) { // Se o usuário não for encontrado, lança uma exceção de não autorizado
      throw new UnauthorizedException('Você não participa deste board.');
    }

    return true; // Retorna true se o usuário estiver conectado ao quadro
  }

  async isConnectedToSwimlane(id: number, swimlaneId: number) { // Método para verificar se o usuário está conectado a uma swimlane
    // Busca o usuário e verifica se ele está conectado à swimlane
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

    if (!user) { // Se o usuário não for encontrado, lança uma exceção de não autorizado
      throw new UnauthorizedException('Você não participa desta swimlane.');
    }

    return true; // Retorna true se o usuário estiver conectado à swimlane
  }

  update(id: number, updateUserDto: UpdateUserDto) { // Método para atualizar um usuário
    // Verifica se o usuário está conectado ao quadro antes de atualizar
    return this.userRepository.update(id, {
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
    });
  }

  remove(id: number) { // Método para remover um usuário
    // Verifica se o usuário está conectado ao quadro antes de remover
    return this.userRepository.delete(id);
  }
}

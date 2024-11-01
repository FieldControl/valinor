import { Injectable, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common'; // Importa decorators e exceções do NestJS
import { UpdateUserDto } from './dto/update-user.dto'; // Importa o DTO para atualização de usuário
import { InjectRepository } from '@nestjs/typeorm'; // Importa o decorator para injeção de repositório
import { User } from './entities/user.entity'; // Importa a entidade do usuário
import { Repository } from 'typeorm'; // Importa o repositório do TypeORM
import { RegisterDto } from 'src/auth/dto/register.dto'; // Importa o DTO para registro de usuário
import { hash } from 'bcrypt'; // Importa a função de hash do bcrypt

@Injectable() // Indica que esta classe pode ser injetada como um serviço
export class UserService {
  constructor(
    @InjectRepository(User) // Injeta o repositório de usuários
    private userRepository: Repository<User>,
  ) {}

  /**
   * Cria um novo usuário.
   * @param createUserDto - Dados para criação do usuário.
   * @returns O usuário criado.
   * @throws ConflictException se o email já estiver em uso.
   */
  async create(createUserDto: RegisterDto): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('Email already in use'); // Verifica se o email já existe
    }

    const user = new User(); // Cria uma nova instância de User
    user.email = createUserDto.email; // Define o email
    user.firstName = createUserDto.firstName; // Define o primeiro nome
    user.lastName = createUserDto.lastName; // Define o sobrenome
    user.password = await hash(createUserDto.password, 10); // Hash a senha antes de salvar
    return this.userRepository.save(user); // Salva o usuário no repositório
  }

  /**
   * Encontra um usuário pelo ID.
   * @param id - ID do usuário.
   * @returns O usuário encontrado ou null se não existir.
   */
  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id }); // Retorna o usuário correspondente ao ID
  }

  /**
   * Verifica se o usuário está conectado a um board específico.
   * @param id - ID do usuário.
   * @param boardId - ID do board.
   * @returns true se o usuário está associado ao board.
   * @throws UnauthorizedException se o usuário não estiver associado ao board.
   */
  async isConnectedToBoard(id: number, boardId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: {
        id,
        boards: {
          id: boardId,
        },
      },
      relations: ['boards'], // Carrega a relação com boards
    });

    // Lança exceção se o usuário não estiver associado ao board
    if (!user) {
      throw new UnauthorizedException('You are not a part of this board.');
    }

    return true; // Retorna true se o usuário está associado ao board
  }

  /**
   * Verifica se o usuário está conectado a uma swimlane específica.
   * @param id - ID do usuário.
   * @param swimlaneId - ID da swimlane.
   * @returns true se o usuário está associado à swimlane.
   * @throws UnauthorizedException se o usuário não estiver associado à swimlane.
   */
  async isConnectedToSwimlane(id: number, swimlaneId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: {
        id,
        boards: {
          swimlanes: {
            id: swimlaneId,
          },
        },
      },
      relations: ['boards', 'boards.swimlanes'], // Carrega as relações com boards e swimlanes
    });

    // Lança exceção se o usuário não estiver associado à swimlane
    if (!user) {
      throw new UnauthorizedException('You are not a part of this swimlane.');
    }

    return true; // Retorna true se o usuário está associado à swimlane
  }

  /**
   * Atualiza informações de um usuário.
   * @param id - ID do usuário.
   * @param updateUserDto - Dados para atualização do usuário.
   * @throws NotFoundException se o usuário não for encontrado.
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<void> {
    const result = await this.userRepository.update(id, {
      firstName: updateUserDto.firstName, // Atualiza o primeiro nome
      lastName: updateUserDto.lastName, // Atualiza o sobrenome
    });

    // Lança exceção se o usuário não for encontrado
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  /**
   * Remove um usuário pelo ID.
   * @param id - ID do usuário.
   * @throws NotFoundException se o usuário não for encontrado.
   */
  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id); // Deleta o usuário do repositório

    // Lança exceção se o usuário não for encontrado
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }
}

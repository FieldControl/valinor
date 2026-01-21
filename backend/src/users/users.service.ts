import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input'; // Se der erro no .ts, apague o .ts
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'; // <--- Importando a criptografia

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    // 1. Verificar se o email já existe
    const existingUser = await this.usersRepository.findOne({ 
        where: { email: createUserInput.email } 
    });
    
    if (existingUser) {
        throw new ConflictException('Este email já está cadastrado.');
    }

    // 2. Criptografar a senha (Hash)
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(createUserInput.password, salt);

    // 3. Criar o usuário com a senha criptografada
    const newUser = this.usersRepository.create({
      ...createUserInput,
      password: passwordHash, // Substitui a senha original pelo hash
    });

    return this.usersRepository.save(newUser);
  }

  // Busca todos (para testar depois)
  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // Busca um pelo ID
 findOne(id: string): Promise<User | null> { 
    return this.usersRepository.findOneBy({ id });
  }

  // Busca pelo Email (usaremos no Login)
  findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }}
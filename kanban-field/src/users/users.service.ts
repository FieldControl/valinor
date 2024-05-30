import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import { CardsService } from '../cards/cards.service';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
              @Inject(forwardRef(() => CardsService))
              private cardService: CardsService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.findByMail(createUserDto.email)

      if (existingUser) {
        throw new Error(`Já existe um usuário com este e-mail`);
      }

      return await this.userModel.create(createUserDto)
    } catch (error) {
      throw new Error(`Falha ao criar o usuário: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const users = await this.userModel.find()

      return users
    } catch (error) {
      throw new Error(`Falha ao consultar todos os usuários: ${error.message}`);
    }
  }

  async findOne(id: string) {                 
    const user = await this.userModel.findById(id); // id do mongo é string
  
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    } 

    user.cards = await this.cardService.find({ responsible: id }, id);

    return user
  }

  async findByMail(email: any): Promise<User | undefined> {                 
    return this.userModel.findOne({ email: email }); // encontrar user cadastrado por email
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(
      id, updateUserDto, { new: true }
    );

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    } 

    return user
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id)

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    } 

    return user
  }
}

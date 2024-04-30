import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import { CardsService } from 'src/cards/cards.service';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
              private cardService: CardsService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = new this.userModel(createUserDto);
      return await user.save();
    } catch (error) {
      throw new Error(`Falha ao criar o usuário: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const users = await this.userModel.find()

      const usersWithCards = await Promise.all(users.map(async (user) => {
        user.cards = await this.cardService.find({ responsible: user._id})
        return user
      }))

      return usersWithCards
    } catch (error) {
      throw new Error(`Falha ao consultar todos os usuários: ${error.message}`);
    }
  }

  async findOne(id: string) {                 
    const user = await this.userModel.findById(id); // id do mongo é string
  
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    } 

    user.cards = await this.cardService.find({ responsible: id });

    return user
  }

  async findByMail(email: string): Promise<User | undefined> {                 
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

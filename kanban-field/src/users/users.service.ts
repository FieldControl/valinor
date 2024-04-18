import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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
      return await this.userModel.find();
    } catch (error) {
      throw new Error(`Falha ao consultar todos os usuários: ${error.message}`);
    }
  }

  async findOne(id: string) {                 
    const user = await this.userModel.findById(id); // id do mongo é string
  
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    } 

    return user
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

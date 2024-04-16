import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  create(createUserDto: CreateUserDto) {
    const user = new this.userModel(createUserDto);

    return user.save();
  }

  findAll() {
    return this.userModel.find();
  }

  findOne(id: string) {                 
    return this.userModel.findById(id); // id do mongo é string
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(
      id, updateUserDto, { new: true }
    );
  }

  remove(id: string) {
    return this.userModel.deleteOne(
      {
        _id: id
      }).exec();
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { registerDto } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class AuthenticateService {
  constructor(
    @InjectRepository(User) private userRepository : Repository<User>,
  private jwtService : JwtService){}

  //Fazendo login
  async login(LoginDto: LoginDto) {
    const user = await this.userRepository.findOne({where: {email: LoginDto.email,}});  

    //se email não encontrado
    if (!user) {
      throw new NotFoundException ('Usuario não encontrado');
    }

    //se senha diferente da cadastrada
    if (!bcrypt.compareSync(LoginDto.password, user.password)){
      throw new BadRequestException ('senha incorreta');
    }

    const payload = {id: user.id, email: user.email};

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }


}

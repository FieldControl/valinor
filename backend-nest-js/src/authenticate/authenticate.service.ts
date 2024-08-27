import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';


//O login está solicitando do banco de dados um cliente compativel com o email, mas não validando os ultimos dados.
//melhorar sistema de liberação dos dados do token. as senhas não estão sendo validadas. apenas os emails.

@Injectable()
export class AuthenticateService {
  constructor(
    @InjectRepository(User) private userRepository : Repository<User>,
  private jwtService : JwtService){}

  //Fazendo login
  async login(LoginDto: LoginDto) {
    
    const user = await this.userRepository.findOne({where: {email: LoginDto.email,}});  
    
    if (!user) {
      throw new NotFoundException ('Usuario não encontrado');
    }

    //Logs para confirmação se o usuario recebido base com o solicitado do banco de dados
    console.log(user)


    if (!bcrypt.compareSync(LoginDto.password, user.password)){
      throw new BadRequestException ('senha incorreta');
    }

    
    const payload = {id: user.id, email: user.email};

    console.log('obrigado pela preferencia')
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }


}

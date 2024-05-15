import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {


  
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepositorio: Repository<Usuario>,
        
  ){}
  
  async login(loginDto: LoginDto) {
     const usuario = await this.usuarioRepositorio.findOne({
      where: {
        email: loginDto.email,
      },
    });
   

    if(!usuario){
      throw new NotFoundException('Usuário não encontrado');
    }

    // Uma boa prática é não guardar a senha em nossa base de usuarios
    // Sei que tem umas formas de ao realizar o cadastro criar um hash da senha 
    //e dai sempre comparar ele quando for logar
    if(loginDto.senha !== usuario.senha){
      throw new UnauthorizedException('Login inválido')
    }

    return {
      usuarioId: usuario.id
    };
  }
}

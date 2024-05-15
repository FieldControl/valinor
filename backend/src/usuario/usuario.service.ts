import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { RegistroDto } from 'src/auth/dto/registro.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsuarioService {

  constructor(
    
      @InjectRepository(Usuario)
      private usuarioRepositorio: Repository<Usuario>,
          
  ){  }

  
  async create(registroDto: RegistroDto) {

    const usuarioExistente = await this.usuarioRepositorio.findOne({
      where: {
        email:registroDto.email
      }
    })

    console.log(usuarioExistente)

    if(usuarioExistente){
      throw new BadRequestException('E-mail já cadastrado');
    }

    const usuario = new Usuario();
    
    usuario.email = registroDto.email;
    usuario.nome = registroDto.nome;
    usuario.sobrenome = registroDto.sobrenome;
    usuario.senha = registroDto.senha;
    

    return this.usuarioRepositorio.save(registroDto);
  }

  
  findOne(id: number) {
    return this.usuarioRepositorio.findOneBy({id});
  }
  
  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioRepositorio.update(id,{
      nome: updateUsuarioDto.nome,
      sobrenome : updateUsuarioDto.sobrenome,

    });
  }

  remove(id: number) {
    return this.usuarioRepositorio.delete(id);
  }
}

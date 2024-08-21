import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AtualizarUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { RegistrarDto } from 'src/autenticar/dto/registro.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  criar(criarUsuarioDto: RegistrarDto) {
    const usuario = new Usuario();
    usuario.email = criarUsuarioDto.email;
    usuario.primeiroNome = criarUsuarioDto.primeiroNome;
    usuario.sobrenome = criarUsuarioDto.sobrenome;
    usuario.senha = criarUsuarioDto.senha;
    return this.usuarioRepository.save(usuario);
  }

  findOne(id: number) {
    return this.usuarioRepository.findOneBy({ id });
  }

  async estaConectadoAoQuadro(id: number, quadroId: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: {
        id,
        quadros: {
          id: quadroId,
        },
      },
      relations: ['quadros'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Voce nao faz parte deste quadro');
    }

    return true;
  }

  async estaConectadoAColuna(id: number, colunaId: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: {
        id,
        quadros: {
          colunas: {
            id: colunaId,
          },
        },
      },
      relations: ['quadros', 'quadros.colunas'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Voce nao faz parte deste quadro');
    }

    return true;
  }

  atualizar(id: number, atualizarUsuarioDto: AtualizarUsuarioDto) {
    return this.usuarioRepository.update(id, {
      primeiroNome: atualizarUsuarioDto.primeiroNome,
      sobrenome: atualizarUsuarioDto.sobrenome,
    });
  }

  excluir(id: number) {
    return this.usuarioRepository.delete(id);
  }
}

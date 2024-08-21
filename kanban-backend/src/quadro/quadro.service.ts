import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CriarQuadroDto } from './dto/create-quadro.dto';
import { AtualizarQuadroDto } from './dto/update-quadro.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quadro } from './entities/quadro.entity';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class QuadroService {
  constructor(
    @InjectRepository(Quadro)
    private quadroRepository: Repository<Quadro>,
    private usuarioService: UsuarioService,
  ) {}

  async usuarioEstaAssociadoComQuadro(quadroId: number, usuarioId: number) {
    const count = await this.quadroRepository.count({
      where: { id: quadroId, usuarios: { id: usuarioId } },
    });
    if (count === 0) {
      throw new UnauthorizedException('O usuario nao esta associado ao quadro');
    }

    return true;
  }

  async criar(criarQuadroDto: CriarQuadroDto, usuarioId: number) {
    const quadro = new Quadro();
    quadro.nome = criarQuadroDto.nome;
    const usuario = await this.usuarioService.findOne(usuarioId);
    quadro.usuarios = [usuario];
    return this.quadroRepository.save(quadro);
  }

  encontrarTodosUsuariosPorId(usuarioId: number) {
    return this.quadroRepository.find({
      where: { usuarios: { id: usuarioId } },
      relations: ['usuarios'],
    });
  }

  findOne(id: number, usuarioId: number) {
    return this.quadroRepository.findOne({
      where: {
        id,
        usuarios: { id: usuarioId },
      },
      relations: ['usuarios', 'colunas', 'colunas.cartoes'],
    });
  }

  async atualizar(id: number, usuarioId: number, atualizarQuadroDto: AtualizarQuadroDto) {
    await this.usuarioEstaAssociadoComQuadro(id, usuarioId);
    return this.quadroRepository.update(id, {
      nome: atualizarQuadroDto.nome,
    });
  }

  async excluir(id: number, usuarioId: number) {
    await this.usuarioEstaAssociadoComQuadro(id, usuarioId);
    return this.quadroRepository.delete(id);
  }
}

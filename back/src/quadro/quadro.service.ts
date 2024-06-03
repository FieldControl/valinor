import { Quadro } from 'src/quadro/entities/quadro.entity';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateQuadroDto } from './dto/create-quadro.dto';
import { UpdateQuadroDto } from './dto/update-quadro.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioService } from 'src/usuario/usuario.service';

@Injectable()
export class QuadroService {
  constructor(
    @InjectRepository(Quadro)
    private quadroRepository: Repository<Quadro>,
    private usuarioService: UsuarioService,
  ){}

  async isUserAssociatedWithBoard(quadroId: number, usuarioId: number) {
    const count = await this.quadroRepository.count({
      where: { id: quadroId, usuario: { id: usuarioId } },
    });
    if (count === 0) {
      throw new UnauthorizedException('Usuario nao pertence ao quadro');
    }

    return true;
  }

  async create(createQuadroDto: CreateQuadroDto, usuarioId: number) {
    const quadro = new Quadro();
   quadro.nome = createQuadroDto.nome;
    const user = await this.usuarioService.findOne(usuarioId);
    quadro.usuario = [user];
    return this.quadroRepository.save(quadro);
  }

  findAllByUsuarioId(usuarioId: number) {
    return this.quadroRepository.find({
      where:{
        usuario: {id: usuarioId}},
        relations: ['usuario'],
    });
  }

  findOne(id: number, usuarioId: number) {
    return this.quadroRepository.findOne({
      where: {
        id,
        usuario: { id: usuarioId },
      },
      relations: ['usuario', 'colunas', 'colunas.cards'],
    });
  }

  async update(id: number, usuarioId: number, updateQuadroDto: UpdateQuadroDto) {
    await this.isUserAssociatedWithBoard(id, usuarioId);
    return this.quadroRepository.update(id, {
      nome: updateQuadroDto.nome,
    });
  }

  async remove(id: number, usuarioId: number) {
    await this.isUserAssociatedWithBoard(id, usuarioId);
    return this.quadroRepository.delete(id);
  }
}

import { Injectable } from '@nestjs/common';
import { CriarColunaDto } from './dto/create-coluna.dto';
import { AtualizarColunaDto } from './dto/update-coluna.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Coluna } from './entities/coluna.entity';
import { Repository } from 'typeorm';
import { UsuarioService } from '../usuario/usuario.service';
import { ReordenarColunaDto } from './dto/reorder-coluna';

@Injectable()
export class ColunaService {
  constructor(
    @InjectRepository(Coluna)
    private colunaRepository: Repository<Coluna>,
    private usuarioService: UsuarioService,
  ) {}

  async criar(criarColunaDto: CriarColunaDto, usuarioId: number) {
    const coluna = new Coluna();
    coluna.nome = criarColunaDto.nome;
    coluna.ordem = criarColunaDto.ordem;
    coluna.quadroId = criarColunaDto.quadroId;

    await this.usuarioService.estaConectadoAoQuadro(usuarioId, coluna.quadroId);
    return this.colunaRepository.save(coluna);
  }

  async atualizarOrdemColuna(reordenar: ReordenarColunaDto, usuarioId: number) {
    await this.usuarioService.estaConectadoAoQuadro(usuarioId, reordenar.quadroId);

    const promises = reordenar.itens.map((coluna) =>
      this.colunaRepository.update(coluna.id, { ordem: coluna.ordem }),
    );

    await Promise.all(promises);

    return true;
  }

  async temAcessoAColuna(colunaId: number, usuarioId: number) {
    const hasAccess = await this.colunaRepository.count({
      where: {
        id: colunaId,
        quadro: { usuarios: { id: usuarioId } },
      },
    });

    return hasAccess > 0;
  }

  encontrarTodosQuadrosPorId(quadroId: number, usuarioId: number) {
    return this.colunaRepository.find({
      where: {
        quadroId,
        quadro: { usuarios: { id: usuarioId } },
      },
    });
  }

  async atualizar(
    id: number,
    usuarioId: number,
    atualizarColunaDto: AtualizarColunaDto,
  ) {
    await this.usuarioService.estaConectadoAoQuadro(
      usuarioId,
      atualizarColunaDto.quadroId,
    );
    return this.colunaRepository.update(id, {
      nome: atualizarColunaDto.nome,
    });
  }

  async excluir(id: number, usuarioId: number) {
    await this.usuarioService.estaConectadoAColuna(usuarioId, id);
    return this.colunaRepository.delete(id);
  }
}

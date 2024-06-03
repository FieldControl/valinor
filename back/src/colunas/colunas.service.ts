import { Injectable } from '@nestjs/common';
import { CreateColunaDto } from './dto/create-coluna.dto';
import { UpdateColunaDto } from './dto/update-coluna.dto';
import { Coluna } from './entities/coluna.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsuarioService } from 'src/usuario/usuario.service';
import { ReordereColunaDto } from './dto/reorder-coluna.dto';

@Injectable()
export class ColunasService {

  constructor(
    @InjectRepository(Coluna)
    private colunaRepository: Repository<Coluna>,
    private usuarioService: UsuarioService,
  ){}


 async create(createColunaDto: CreateColunaDto, usuarioId: number) {
    const coluna = new Coluna();
    coluna.nome = createColunaDto.nome;
    coluna.ordem = createColunaDto.ordem;
    coluna.quadroId = createColunaDto.quadroId;

    await this.usuarioService.isConnectedToQuadro(usuarioId, coluna.quadroId);
    return this.colunaRepository.save(coluna);
  }

  
  async updateOrdemDeColunas(reorder: ReordereColunaDto, usuarioId: number) {
    await this.usuarioService.isConnectedToQuadro(usuarioId, reorder.quadroId);

    const promises = reorder.items.map((coluna) =>
      this.colunaRepository.update(coluna.id, { ordem: coluna.ordem }),
    );

    await Promise.all(promises);

    return true;
  }

  async hasAccessToColuna(colunaId: number, usuarioId: number) {
    const hasAccess = await this.colunaRepository.count({
      where: {
        id: colunaId,
        quadro: { usuario: { id: usuarioId } },
      },
    });

    return hasAccess > 0;
  }


  findAllByQuadroId(quadroId: number, usuarioId: number) {
    return this.colunaRepository.find({
      where: {
        quadroId,
        quadro: { usuario: { id: usuarioId } },
      },
    });
  }

  async update(id: number,usuarioId: number,updateColunaDto: UpdateColunaDto,) {
    await this.usuarioService.isConnectedToQuadro(
      usuarioId,
      updateColunaDto.quadroId,
    );
    return this.colunaRepository.update(id, {
      nome: updateColunaDto.nome,
    });
  }

  async remove(id: number, usuarioId: number) {
    await this.usuarioService.isConnectedToColuna(usuarioId, id);
    return this.colunaRepository.delete(id);
  }
}

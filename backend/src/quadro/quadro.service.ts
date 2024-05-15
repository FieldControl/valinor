import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuadroDto } from './dto/create-quadro.dto';
import { UpdateQuadroDto } from './dto/update-quadro.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Quadro } from './entities/quadro.entity';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Injectable()
export class QuadroService {
  constructor(
    @InjectRepository(Quadro)
    private quadroRepositorio: Repository<Quadro>,
    @InjectRepository(Usuario)
    private usuarioRepositorio: Repository<Usuario>,
  ) {}
  async create(createQuadroDto: CreateQuadroDto, usuarioId: number) {
    const usuario = await this.usuarioRepositorio.findOneBy({
      id: usuarioId,
    });

    if(!usuario) {
      throw new NotFoundException('Usuario não encontrado')
    }

    const quadro = new Quadro();
    quadro.nome = createQuadroDto.nome;
    quadro.usuario = usuario;
    return this.quadroRepositorio.save([quadro]);
  }

  findAllByUserId(userId: number) {
    console.log(userId)
    return this.quadroRepositorio.find({
      where: { usuario: { id: userId } },
      relations: ['colunas', 'colunas.tarefas'],
    });
  }

  findOne(id: number, usuarioId: number) {
    return this.quadroRepositorio.findOne({
      where: {
        id,
        usuario: { id: usuarioId },
      }, // Relations adicionada para que ao buscar o quadro, o ORM também já ajuste a query SQL pra fazer
         // um join nas tabelas de colunas e tarefas e trazer todos os dados.
      relations: ['usuario', 'colunas', 'colunas.tarefas'],
    });
  }

  update(id: number, usuarioId: number, updateQuadroDto: UpdateQuadroDto) {
    return this.quadroRepositorio.update(
      {
        id,
        usuario: {
          id: usuarioId,
        },
      },
      {
        nome: updateQuadroDto.nome,
      },
    );
  }

  remove(id: number, usuarioId: number) {
    return this.quadroRepositorio.delete({
      id: id,
      usuario: {
        id: usuarioId
      }
    });
  }
}

import { Get, Injectable, NotFoundException } from '@nestjs/common';
import { CreateColunaDto } from './dto/create-coluna.dto';
import { UpdateColunaDto } from './dto/update-coluna.dto';
import { Coluna } from './entities/coluna.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Quadro } from 'src/quadro/entities/quadro.entity';

@Injectable()
export class ColunaService {

  constructor(
    @InjectRepository(Quadro)
    private quadroRepositorio: Repository<Quadro>,
    @InjectRepository(Coluna)
    private colunaRepositorio: Repository<Coluna>,
        
  ){  }


    /**
   * Cria uma coluna para o quadro passado
   */
  async create(createColunaDto: CreateColunaDto) {
    // Acredito que também na hora de buscar o quadro, podemos também passar o usuarioId que está
    // dentro do header que simula a autenticação, assim a gente garante que quem tá criando a coluna
    // é o 'dono' ou 'membro' do quadro
    const quadro = await this.quadroRepositorio.findOneBy(
      {
        id:createColunaDto.quadroId
      }
    )

    if(!quadro){
      throw new NotFoundException('Quadro não encontrado');
    }

    const coluna = new Coluna();
    coluna.nome = createColunaDto.nome;
    coluna.quadroId = createColunaDto.quadroId;
  

    return this.colunaRepositorio.save([coluna]);
  }

  
  findByQuadroId(quadroId : number) {
    return this.colunaRepositorio.find({
      where: {quadroId},
    } );
  }

    /**
   * Aqui acredito que também podemos incluir uma lógica para fazer o update da 'ordem' da coluna
   * pra na hora de exibir no front podermos definir qual coluna vem primeiro.
   * Ou então criar outro método focado nisso e talvez até expor num endpoint específico pra controlar o update
   * das ordens das colunas e tarefas.
   */
  update(id: number, updateColunaDto: UpdateColunaDto) {
    return this.colunaRepositorio.update(   
      id, {
        nome : updateColunaDto.nome,
      });
  }

  remove(id: number) {
    return this.colunaRepositorio.delete(id);
  }
}

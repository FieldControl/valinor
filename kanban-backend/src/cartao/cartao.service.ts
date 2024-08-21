import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CriarCartaoDto } from './dto/create-cartao.dto';
import { AtualizarCartaoDto } from './dto/update-cartao.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cartao } from './entities/cartao.entity';
import { Repository } from 'typeorm';
import { ColunaService } from '../coluna/coluna.service';
import { UsuarioService } from '../usuario/usuario.service';
import { ReordenarCartaoDto } from './dto/reorder-cartao';

@Injectable()
export class CartaoService {
  constructor(
    @InjectRepository(Cartao)
    private cartaoRepository: Repository<Cartao>,
    private colunaService: ColunaService,
    private usuarioService: UsuarioService,
  ) {}

  async criar(criarCartaoDto: CriarCartaoDto, usuarioId: number) {
    const cartao = new Cartao();
    cartao.nome = criarCartaoDto.nome;
    cartao.conteudo = criarCartaoDto.conteudo;
    cartao.colunaId = criarCartaoDto.colunaId;
    cartao.ordem = criarCartaoDto.ordem;
    const temAcessoAColuna = await this.colunaService.temAcessoAColuna(
      criarCartaoDto.colunaId,
      usuarioId,
    );
    if (!temAcessoAColuna) {
      throw new UnauthorizedException('Você não faz parte deste quadro.');
    }
    return this.cartaoRepository.save(cartao);
  }

  async atualizarOrdemCartaoEColuna(
    reordenar: ReordenarCartaoDto,
    usuarioId: number,
  ) {
    await this.usuarioService.estaConectadoAoQuadro(usuarioId, reordenar.quadroId);

    const promises = reordenar.cartoes.map((cartao) =>
      this.cartaoRepository.update(cartao.id, {
        ordem: cartao.ordem,
        colunaId: cartao.colunaId,
      }),
    );

    await Promise.all(promises);

    return true;
  }

  async atualizar(id: number, usuarioId: number, atualizarCartaoDto: AtualizarCartaoDto) {
    await this.usuarioService.estaConectadoAColuna(
      usuarioId,
      atualizarCartaoDto.colunaId,
    );
    return this.cartaoRepository.update(id, {
      nome: atualizarCartaoDto.nome,
      conteudo: atualizarCartaoDto.conteudo,
    });
  }

  async excluir(id: number, usuarioId: number) {
    const cartao = await this.cartaoRepository.findOneBy({ id });
    await this.usuarioService.estaConectadoAColuna(usuarioId, cartao.colunaId);
    return this.cartaoRepository.delete(id);
  }
}

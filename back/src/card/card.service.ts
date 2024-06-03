import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ColunasService } from 'src/colunas/colunas.service';
import { UsuarioService } from 'src/usuario/usuario.service';
import { ReorderedCardDto } from './dto/reorder-cards.dto';

@Injectable()
export class CardService {

  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private colunasService: ColunasService,
    private usuarioService: UsuarioService,
  ){}

  async create(createCardDto: CreateCardDto, usuarioId: number) {
    const card = new Card();
    card.nome = createCardDto.nome;
    card.conteudo = createCardDto.conteudo;
    card.colunaId = createCardDto.colunaId;
    card.ordem = createCardDto.ordem;
    const hasAccessToColuna = await this.colunasService.hasAccessToColuna(
      createCardDto.colunaId,
      usuarioId,
    );
    if (!hasAccessToColuna) {
      throw new UnauthorizedException('Voce nao faz parte do quadro');
    }
    return this.cardRepository.save(card);
  }

  async updateCardOrdersEColunas(reorder: ReorderedCardDto, usuarioId: number) {
    await this.usuarioService.isConnectedToQuadro(usuarioId, reorder.quadroId);

    const promises = reorder.cards.map((card) =>
      this.cardRepository.update(card.id, {
        ordem: card.ordem,
        colunaId: card.colunaId,
      }),
    );

    await Promise.all(promises);

    return true;
  }

  async update(id: number, usuarioId: number, updateCardDto: UpdateCardDto) {
    await this.usuarioService.isConnectedToColuna(
      usuarioId,
      updateCardDto.colunaId,
    );
    return this.cardRepository.update(id, {
      nome: updateCardDto.nome,
      conteudo: updateCardDto.conteudo,
    });
  }

  async remove(id: number, usuarioId: number) {
    const card = await this.cardRepository.findOneBy({ id });
    await this.usuarioService.isConnectedToColuna(usuarioId, card.colunaId);
    return this.cardRepository.delete(id);
  }

  
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class KanbanService {
  private cards: any[] = [];

  create(createCardDto: CreateCardDto): Promise<any> {
    const newCard = { ...createCardDto, id: Date.now() };
    this.cards.push(newCard);
    return Promise.resolve(newCard);
  }

  findAll(): Promise<any[]> {
    return Promise.resolve(this.cards);
  }

  update(id: string, updateCardDto: UpdateCardDto): Promise<any> {
    const cardIndex = this.cards.findIndex(card => card.id.toString() === id);
    if (cardIndex === -1) {
      throw new NotFoundException(`Card com id ${id} não encontrado`);
    }

    // 🔍 Verifica se status é válido (se estiver presente)
    if (updateCardDto.status) {
      const statusValido = ['Pendente', 'Fazendo', 'Finalizado'];
      if (!statusValido.includes(updateCardDto.status)) {
        throw new BadRequestException(`Status inválido: ${updateCardDto.status}`);
      }
    }

    // 👀 Depuração: mostra o DTO recebido
    console.log('Atualizando card:', updateCardDto);

    this.cards[cardIndex] = { ...this.cards[cardIndex], ...updateCardDto };
    return Promise.resolve(this.cards[cardIndex]);
  }

  moveCard(id: string, status: string): Promise<any> {
    const card = this.cards.find(card => card.id.toString() === id);
    if (!card) {
      throw new NotFoundException(`Card com id ${id} não encontrado`);
    }

    const statusValido = ['Pendente', 'Fazendo', 'Finalizado'];
    if (!statusValido.includes(status)) {
      throw new BadRequestException(`Status inválido: ${status}`);
    }

    card.status = status;
    return Promise.resolve(card);
  }

  remove(id: string): Promise<void> {
    const cardIndex = this.cards.findIndex(card => card.id.toString() === id);
    if (cardIndex === -1) {
      throw new NotFoundException(`Card com id ${id} não encontrado`);
    }
    this.cards.splice(cardIndex, 1);
    return Promise.resolve();
  }
}

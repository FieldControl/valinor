import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { Card } from './entities/card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { SwimlaneService } from 'src/swimlane/swimlane.service';
import { ReorderedCardDto } from './dto/reorder-cards.dto'; 

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private swimlaneService: SwimlaneService,
  ) {}

  async create(createCardDto: CreateCardDto): Promise<Card> {
    const card = new Card();
    card.name = createCardDto.name;
    card.content = createCardDto.content;

    const swimlane = await this.swimlaneService.findOne(createCardDto.swimlaneId);
    if (!swimlane) {
      throw new Error('Swimlane not found');
    }
    card.swimlane = swimlane;
    
    card.order = createCardDto.order;

    // Remova qualquer verificação de acesso de usuário se não for necessário
    return this.cardRepository.save(card);
  }

  async findAll(): Promise<Card[]> {
    return this.cardRepository.find();
  }

  async findOne(id: number): Promise<Card> {
    return this.cardRepository.findOneBy({ id });
  }

  async update(id: number, updateCardDto: UpdateCardDto): Promise<UpdateResult> {
    // Remova qualquer verificação de acesso de usuário se não for necessário
    return this.cardRepository.update(id, {
      name: updateCardDto.name,
      content: updateCardDto.content,
    });
  }

  async remove(id: number): Promise<DeleteResult> {
    const card = await this.cardRepository.findOneBy({ id });
    if (!card) {
      throw new Error('Card not found');
    }

    // Remova qualquer verificação de acesso de usuário se não for necessário
    return this.cardRepository.delete(id);
  }

  async reorder(reorderCardsDto: ReorderedCardDto): Promise<void> {
    // Implementar a lógica para reorder, se necessário
    const { boardId, cards } = reorderCardsDto;
  }
}



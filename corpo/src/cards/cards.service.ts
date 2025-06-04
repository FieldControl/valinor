import { Injectable, NotFoundException } from '@nestjs/common';
    import { InjectRepository } from '@nestjs/typeorm';
    import { Repository } from 'typeorm';
    import { Card } from '../entities/card.entity';
    import { BoardColumn } from '../entities/column.entity';
    import { CreateCardDto } from '../cards/dto/create-card.dto';
    import { UpdateCardDto } from './dto/update-card.dto';

    @Injectable()
    export class CardsService {
      constructor(
        @InjectRepository(Card)
        private cardsRepository: Repository<Card>,
        @InjectRepository(BoardColumn)
        private columnsRepository: Repository<BoardColumn>,
      ) {}

      async findAll(): Promise<Card[]> {
        return this.cardsRepository.find();
      }

      async findOne(id: number): Promise<Card> {
        const card = await this.cardsRepository.findOne({ where: { id } });
        if (!card) {
          throw new NotFoundException(`Card with ID ${id} not found.`);
        }
        return card;
      }

      async create(createCardDto: CreateCardDto): Promise<Card> {
        const column = await this.columnsRepository.findOne({ where: { id: createCardDto.columnId } });
        if (!column) {
          throw new NotFoundException(`Column with ID ${createCardDto.columnId} not found.`);
        }
        const newCard = this.cardsRepository.create({
          title: createCardDto.title,
          description: createCardDto.description,
          column: column,
        });
        return this.cardsRepository.save(newCard);
      }

      async update(id: number, updateCardDto: UpdateCardDto): Promise<Card> {
          const card = await this.cardsRepository.findOne({ where: { id }, relations: ['column'] });
          if (!card) {
            throw new NotFoundException(`Card with ID ${id} not found.`);
          }
          
          if (updateCardDto.title !== undefined) {
            card.title = updateCardDto.title;
          }
          if (updateCardDto.description !== undefined) {
            card.description = updateCardDto.description;
          }

          // Se veio novo columnId e é diferente do atual, atualiza a relação
          if (updateCardDto.columnId && updateCardDto.columnId !== card.column?.id) {
            const newColumn = await this.columnsRepository.findOne({ where: { id: updateCardDto.columnId } });
            if (!newColumn) {
              throw new NotFoundException(`New column with ID ${updateCardDto.columnId} not found.`);
            }
            card.column = newColumn;
          }

          return this.cardsRepository.save(card);
        }

      async remove(id: number): Promise<void> {
        const result = await this.cardsRepository.delete(id);
        if (result.affected === 0) {
          throw new NotFoundException(`Card with ID ${id} not found.`);
        }
      }
    }
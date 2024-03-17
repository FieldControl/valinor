import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../../user/user.service';
import { ColumnsService } from '../columns/columns.service';
import { Card } from './cards.entity';
import { CreateCardInput } from './dto/create-card.input';
import { UpdateColumnToCardInput } from './dto/update-card-column.input';
import { UpdateUserToCardInput } from './dto/update-card-user.input';
import { UpdateCardInput } from './dto/update-card.input';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private userService: UserService,
    private colomnService: ColumnsService,
  ) {}

  async findAllCard(): Promise<Card[]> {
    const card = await this.cardRepository.find();
    return card;
  }

  async findCardById(id: string): Promise<Card> {
    const card = await this.cardRepository.findOne({ where: { id } });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return card;
  }

  async findCardByUserId(userId: string): Promise<Card[]> {
    const cards = await this.cardRepository.find({
      where: { user: { id: userId } },
    });

    if (!cards) {
      throw new NotFoundException('Card not found');
    }

    return cards;
  }

  async findCardByColumnId(columnId: string): Promise<Card[]> {
    const cards = await this.cardRepository.find({
      where: { columnsTable: { id: columnId } },
    });

    if (!cards) {
      throw new NotFoundException('Card not found');
    }

    return cards;
  }

  async createCard(data: CreateCardInput): Promise<Card> {
    const column = await this.colomnService.findColumnById(data.column);
    const user = await this.userService.findUserById(data.user);

    if (!column) {
      throw new NotFoundException('Column not found.');
    }

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const card = this.cardRepository.create({
      title: data.title,
      description: data.description,
      columnsTable: column,
      user: user,
    });

    const cardSaved = await this.cardRepository.save(card);

    if (!cardSaved) {
      throw new InternalServerErrorException('Error when creating a new card.');
    }

    return cardSaved;
  }

  async updateCard(id: string, data: UpdateCardInput): Promise<Card> {
    const card = await this.findCardById(id);

    const updatedCard = { ...card, ...data };
    const cardUpdated = await this.cardRepository.save(updatedCard);

    return cardUpdated;
  }

  async updateUserToCard(
    id: string,
    data: UpdateUserToCardInput,
  ): Promise<Card> {
    const user = await this.userService.findUserById(data.user);
    const card = await this.findCardById(id);

    card.user = user;
    const cardUpdated = await this.cardRepository.save(card);

    // await this.cardRepository.update(card, { user });
    // const cardUpdated = { ...card, ...user };

    return cardUpdated;
  }

  async updateColumnToCard(
    id: string,
    data: UpdateColumnToCardInput,
  ): Promise<Card> {
    const column = await this.colomnService.findColumnById(data.column);
    const card = await this.findCardById(id);

    card.columnsTable = column;
    const cardUpdated = await this.cardRepository.save(card);
    // await this.cardRepository.update(card, { columnsTable: column });
    // const cardUpdated = { ...card, ...column };

    return cardUpdated;
  }

  async deleteCard(id: string): Promise<boolean> {
    const card = await this.findCardById(id);

    const deleted = await this.cardRepository.remove(card);

    if (deleted) {
      return true;
    }
    return false;
  }
}

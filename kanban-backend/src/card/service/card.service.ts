import { Injectable } from "@nestjs/common";
import { Card } from "../model/card.model";
import { ColumnService } from "./column.service";
import { UpdateCardLocationDto } from "../dto/update-card-location.dto";

@Injectable()
export class CardService {

  private cards: Card[] = [];
  private lastId: number = 0;

  generateId(): number {
    return ++this.lastId;
  }

  constructor(private readonly columnService: ColumnService) {}

  async createCard(columnId: number, title: string) {
    const columns = await this.columnService.getColumns();

    const column = columns.find(column => column.id === columnId);
    if (!column) {
      throw new Error('Column not found');
    }

    const newCard = { id: this.generateId(), title };
    column.cards.push(newCard);
    this.cards.push(newCard);

    return newCard;
  }

  async getCards(): Promise<Card[]> {
    return this.cards;
  }

  async updateCardTitle(cardId: number, newTitle: string): Promise<Card> {
    const card = this.cards.find(card => card.id == cardId);

    if (!card) {
      throw new Error('Card not found');
    }

    card.title = newTitle;

    return card;
  }

  async getCardsByColumnId(columnId: number): Promise<Card[]> {
    const columns = await this.columnService.getColumns();
    const column = columns.find(column => column.id == columnId);
    
    if (!column) {
      throw new Error('Column not found');
    }

    return column.cards;
  }
  
  async updateCardLocation(dto: UpdateCardLocationDto): Promise<Card> {
    const card = this.cards.find(c => c.id === dto.cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    const previousColumn = (await this.columnService.getColumns()).find(column => column.id === dto.previousColumnId);
    if (!previousColumn) {
      throw new Error('Previous column not found');
    }
    previousColumn.cards = previousColumn.cards.filter(c => c.id !== dto.cardId);

    const newColumn = (await this.columnService.getColumns()).find(column => column.id === dto.currentColumnId);
    if (!newColumn) {
      throw new Error('New column not found');
    }
    newColumn.cards.push(card);

    return card;
  }

}

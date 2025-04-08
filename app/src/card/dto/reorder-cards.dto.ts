import { Card } from '../entities/card.entity';

export class ReorderedCardDto { // Os arquivos .dto são usados para definir os objetos de transferência de dados (DTOs) que serão usados nas requisições e respostas da API.
  boardId: number;
  cards: Card[];
}

import { Injectable } from '@nestjs/common';
import { Card } from './card.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CardService {
  //Este bloco cria um novo card com o título, a descrição e o ID gerado
  createCard(title: string, description: string): Card {
    return {
      id: uuidv4(),
      title,
      description,
    };
  }
}

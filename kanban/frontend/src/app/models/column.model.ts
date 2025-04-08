//Representação do tipo Column no frontend
import { Card } from './card.model';

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

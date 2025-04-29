import { Column as Coluna } from '../../columns/entities/columns.entity';
export declare class Card {
    id: number;
    nome: string;
    descricao: string;
    colunaId: number;
    coluna: Coluna;
}

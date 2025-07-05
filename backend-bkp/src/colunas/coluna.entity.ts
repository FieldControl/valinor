/**
 * Representa uma coluna do quadro Kanban
 */
export class Coluna {
    /** identificador único da coluna */
    id: string;

    /** título da coluna */
    titulo: string;

    /** lista de cards associados a esta coluna */
    cards: Card[];

    constructor(partial: Partial<Coluna>) {
        Object.assign(this, partial);
    }
}

/**
 * Representa um card dentro de uma coluna
 */
export class Card {
    /** identificador único do card */
    id: string;

    /** título do card */
    titulo: string;

    /** descrição opcional do card */
    descricao?: string;

    constructor(partial: Partial<Card>) {
        Object.assign(this, partial);
    }
}

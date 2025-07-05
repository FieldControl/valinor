import { Injectable, NotFoundException } from '@nestjs/common';
import { Coluna } from './coluna.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ColunasService {
    // nosso "banco de dados" em memória
    private colunas: Coluna[] = [];

    /**
     * Retorna todas as colunas
     */
    findAll(): Coluna[] {
        return this.colunas;
    }

    /**
     * Cria uma nova coluna
     */
    create(titulo: string): Coluna {
        const coluna = new Coluna({
            id: uuidv4(),
            titulo,
            cards: [],
        });
        this.colunas.push(coluna);
        return coluna;
    }

    /**
     * Atualiza parcialmente a coluna (usando DTO de update)
     */
    updateColuna(
        id: string,
        updates: Partial<{ titulo: string; cards: any[] }>
    ): Coluna {
        const coluna = this.findById(id);
        if (updates.titulo !== undefined) {
            coluna.titulo = updates.titulo;
        }
        if (updates.cards !== undefined) {
            coluna.cards = updates.cards;
        }
        return coluna;
    }

    /**
     * Busca uma coluna pelo id
     */
    findById(id: string): Coluna {
        const coluna = this.colunas.find((c) => c.id === id);
        if (!coluna) throw new NotFoundException('Coluna não encontrada');
        return coluna;
    }

    /**
     * Atualiza apenas o título da coluna (se ainda quiser usar)
     */
    update(id: string, titulo: string): Coluna {
        const coluna = this.findById(id);
        coluna.titulo = titulo;
        return coluna;
    }

    /**
     * Remove uma coluna
     */
    remove(id: string): void {
        const index = this.colunas.findIndex((c) => c.id === id);
        if (index === -1) throw new NotFoundException('Coluna não encontrada');
        this.colunas.splice(index, 1);
    }

    /**
     * Cria um card dentro de uma coluna
     */
    createCard(colunaId: string, titulo: string, descricao?: string) {
        const coluna = this.findById(colunaId);
        const card = {
            id: uuidv4(),
            titulo,
            descricao,
        };
        coluna.cards.push(card);
        return card;
    }

    /**
     * Atualiza um card
     */
    updateCard(
        cardId: string,
        updates: Partial<{ titulo: string; descricao: string }>
    ) {
        for (const coluna of this.colunas) {
            const card = coluna.cards.find((c) => c.id === cardId);
            if (card) {
                if (updates.titulo !== undefined) card.titulo = updates.titulo;
                if (updates.descricao !== undefined) card.descricao = updates.descricao;
                return card;
            }
        }
        throw new NotFoundException('Card não encontrado');
    }

    /**
     * Remove um card
     */
    removeCard(cardId: string) {
        for (const coluna of this.colunas) {
            const index = coluna.cards.findIndex((c) => c.id === cardId);
            if (index >= 0) {
                coluna.cards.splice(index, 1);
                return;
            }
        }
        throw new NotFoundException('Card não encontrado');
    }
}

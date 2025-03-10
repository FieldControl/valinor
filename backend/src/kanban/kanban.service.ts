import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class KanbanService {
  constructor(private prisma: PrismaService) {}

  //criando um metodo para retornar as colunas
  async getColumns() {
    return this.prisma.column.findMany({ include: { cards: true } });
  }

  //metodo para criar as colunas
  async createColumn(title: string) {
    if (!title || title.trim() === '') {
      throw new NotFoundException('Title is required');
    }

    const columnExists = await this.prisma.column.findFirst({
      where: { title },
    });
    if (columnExists) {
      throw new NotFoundException('Title already exists');
    }

    const column = await this.prisma.column.create({
      data: { title },
    });

    // Garantir que o retorno tenha a estrutura de Column com o campo cards
    return { ...column, cards: [] };
  }

  //atualizar o titulo de uma coluna
  async updateColumn(id: number, title: string) {
    // Buscando a coluna pelo ID
    const column = await this.prisma.column.findFirst({ where: { id } });
    if (!column) {
      throw new NotFoundException('Column not found');
    }

    // Atualizando o título da coluna
    const updatedColumn = await this.prisma.column.update({
      where: { id },
      data: { title },
    });

    // Retornando a coluna atualizada com cards vazios
    return { ...updatedColumn, cards: [] };
  }

  //Deletar uma coluna
  async deleteColumn(id: number) {
    // Verificando se a coluna existe
    const column = await this.prisma.column.findFirst({ where: { id } });
    if (!column) {
      throw new NotFoundException('Column not found');
    }

    // Deletar os Cards associados à coluna
    await this.prisma.card.deleteMany({
      where: { columnId: id },
    });

    // Deletando a coluna
    const deletedColumn = await this.prisma.column.delete({
      where: { id },
    });

    // Retornando a coluna deletada com cards vazios
    return { ...deletedColumn, cards: [] };
  }

  //função de criar card
  async createCard(title: string, description: string, columnId: number) {
    // Verificando se a coluna existe
    const column = await this.prisma.column.findFirst({
      where: { id: columnId },
    });
    if (!column) {
      throw new NotFoundException('Column not found');
    }

    // Criando o card
    const card = await this.prisma.card.create({
      data: {
        title,
        description,
        columnId,
      },
      include: { column: true },
    });

    // Retornando o card criado com a coluna associada
    return {
      ...card,
      column: { id: card.columnId, title: column.title, cards: [] },
    };
  }

  //atualizar o titulo ou a descrição de um card
  async updateCard(cardId: number, title: string, description: string) {
    // Verificando se o card existe
    const card = await this.prisma.card.findFirst({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('Card not found');
    }

    // Atualizando o card
    const updatedCard = await this.prisma.card.update({
      where: { id: cardId },
      data: { title, description },
      include: { column: true },
    });

    // Retornando o card atualizado com a coluna associada
    return {
      ...updatedCard,
      column: {
        id: updatedCard.columnId,
        title: updatedCard.column.title,
        cards: [],
      },
    };
  }

  //deletar um card
  async deleteCard(cardId: number) {
    // Verificando se o card existe
    const card = await this.prisma.card.findFirst({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('Card not found');
    }

    // Deletando o card
    const deletedCard = await this.prisma.card.delete({
      where: { id: cardId },
      include: { column: true },
    });

    // Retornando o card deletado com a coluna associada
    return {
      ...deletedCard,
      column: {
        id: deletedCard.columnId,
        title: deletedCard.column.title,
        cards: [],
      },
    };
  }
}

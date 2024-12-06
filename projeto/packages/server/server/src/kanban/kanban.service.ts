import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class KanbanService {
    constructor(private prisma: PrismaService){}

    //Adiciona uma coluna
    async criaColuna(titulo: string){
        return this.prisma.coluna.create({
            data: { titulo },
        });
    }

    //Adicionar o card na coluna
    async criaCard(idColuna: number, titulo: string, descricao: string) {
        console.log('Dados recebidos para criação do card', {idColuna, titulo, descricao})
        return this.prisma.card.create({
            data: {
                titulo, 
                idColuna,
                descricao
            },
        });
    }


    async getCardsByColuna(idColuna: number) { //Pega os cards da coluna
        return this.prisma.card.findMany({
          where: {
            idColuna: parseInt(idColuna.toString(), 10),  // Filtra os cards pela coluna
          },
        });
      }

    async pegaColunas() { // Função para retornar as colunas com cards
        return this.prisma.coluna.findMany({
            include: { cards: true },
        });
    }


async deletarCard(colunaId: number, cardId: number): Promise<void> {
  const coluna = await this.prisma.coluna.findUnique({
    where: { idColuna: colunaId },
    include: { cards: true },
  });

  if (!coluna) {
    throw new Error('Coluna não encontrada');
  }

  const card = coluna.cards.find((card) => card.idCard === cardId); //Constante para achar o card que está sendo requisitado baseado no cardId do banco de dados.
  if (!card) {
    throw new Error('Card não encontrado');
  }

  await this.prisma.card.delete({
    where: { idCard: cardId },
  });
}

  async editarCard(colunaId: number, cardId: number, titulo: string, descricao: string): Promise<void> {
    
    const coluna = await this.prisma.coluna.findUnique({ //Garante que a coluna exista
      where: {idColuna: colunaId},
      include: { cards: true },
    });
  
    if (!coluna){
      throw new Error('Coluna não encontrada!');
    }

    const card = coluna.cards.find((card) => card.idCard === cardId); // Garante a existência do card
    if (!card){
      throw new Error ('Card não encontrado');
    }

    await this.prisma.card.update({
      where: {idCard: cardId},
      data: {
        titulo,
        descricao,
      },
    });
  }

  async editarColuna(colunaId: number, titulo: string): Promise<void>{
    
    const coluna = await this.prisma.coluna.findUnique({
      where: {idColuna: colunaId},
    });
  
    if (!coluna) {
      throw new Error('Coluna não encontrada!');
    }
    await this.prisma.coluna.update({
      where: {idColuna: colunaId},
      data: {titulo},
    });
  }


}

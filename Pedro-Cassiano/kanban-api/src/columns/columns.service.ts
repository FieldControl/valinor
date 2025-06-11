/** O Cérebro: Aqui fica a parte lógica. O controller é só um intermediário */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

// Nosso "molde" para os dados de uma coluna.
// Vamos adicionar os cartões aqui depois.
export interface Card {
  id: number;   // ID único da coluna, como "1", "2", etc.
  title: string; // Título da coluna, como "A Fazer", "Em Andamento", etc.
  content: string; // Adicionando o campo content para armazenar os cartões
}
export interface Column {
  id: number;   // ID único do cartão, como "1", "2", etc.  
  title: string; // Título do cartão, como "Configurar o back-end"
  cards: Card[]; // Lista de cartões dentro da coluna
}
@Injectable()
export class ColumnsService {
  // Nosso "banco de dados" em memória, começando com alguns dados de exemplo.
   private readonly columns: Column[] = [
    { id: 1, title: 'A Fazer', cards: [{id: 1, title: 'Configurar o back-end', content: 'Usar o NestJS'}] },
    { id: 2, title: 'Em Andamento', cards: [] },
    { id: 3, title: 'Concluído', cards: [] },
  ];
 
  findAll() {
    return this.columns;
  }

  findOne(id: number) {
    const column = this.columns.find(column => column.id === id);
    if (!column) {
        // Lança um erro 404 se a coluna não for encontrada
        throw new NotFoundException(`Coluna com ID ${id} não encontrada`);
    }
    return column;
  }

  create(createColumnDto: CreateColumnDto) {
    return 'This action adds a new column';
  }

  update(id: number, updateColumnDto: UpdateColumnDto) {
    return `This action updates a #${id} column`;
  }

  remove(id: number) {
    return `This action removes a #${id} column`;
  }
}
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { ColumnType } from './column.type'; 
import { CreateColumnInput } from './create-column.input';
import { ColumnService } from './column.service';
import { TaskService } from '../task/task.service';

@Resolver(() => ColumnType)
export class ColumnResolver {
  constructor(private columnService: ColumnService, private taskService: TaskService) {}

    // Mutação para criar uma coluna
  @Mutation(() => ColumnType)
  async createColumn(
    @Args('createColumnInput') createColumnInput: CreateColumnInput,
  ): Promise<ColumnType> {
    const createdColumn = await this.columnService.create(createColumnInput);
    return {
      id: createdColumn._id.toString(),  // Convertendo o _id do MongoDB para string
      name: createdColumn.name,
      color: createdColumn.color
    };
  }

 // Consulta para pegar todas as colunas
  @Query(() => [ColumnType]) 
  async getAllColumns(): Promise<ColumnType[]> {
    return this.columnService.findAll();  // Retornando todas as colunas
  }

  // Mutação para deletar uma coluna
  @Mutation(() => Boolean)
  async deleteColumn(@Args('id') id: string): Promise<boolean> {
    try {
      // Excluindo as tarefas associadas à coluna
      await this.taskService.removeMany(id);
  
      // Excluindo a coluna
      await this.columnService.remove(id);
  
      // Retorne true se tudo correr bem
      return true;
    } catch (error) {
      console.error('Erro ao deletar coluna e tarefas:', error);
      return false; // Retorna false se algo falhar
    }
  }
}
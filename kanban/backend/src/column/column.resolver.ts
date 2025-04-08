import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Column } from './column.model';
import { ColumnService } from './column.service';
import { CreateColumnInput } from './dto/create-column.input';
import { UpdateColumnInput } from './dto/update-column.input';

@Resolver(() => Column)
export class ColumnResolver {
  constructor(private columnService: ColumnService) {}

  //Retorna todas as colunas
  @Query(() => [Column])
  columns(): Column[] {
    return this.columnService.findAll();
  }

  //Cria uma nova coluna
  @Mutation(() => Column)
  createColumn(@Args('input') input: CreateColumnInput): Column {
    return this.columnService.create(input);
  }

  //Atualiza o título de uma coluna
  @Mutation(() => Column)
  updateColumn(@Args('id') id: string, @Args('title') title: string): Column {
    return this.columnService.update(id, title);
  }

  //Remove uma coluna pelo id
  @Mutation(() => Boolean)
  deleteColumn(@Args('id') id: string): boolean {
    return this.columnService.delete(id);
  }
}

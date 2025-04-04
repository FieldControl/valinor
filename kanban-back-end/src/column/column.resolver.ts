import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Column } from './column.model';
import { ColumnService } from './column.service';

@Resolver(() => Column)
export class ColumnResolver {
  constructor(private columnService: ColumnService) {}

  //Bloco de onsulta para obter todas as colunas
  @Query(() => [Column])
  getColumns(): Column[] {
    return this.columnService.getAll();
  }

  //Bloco de mutation para criar uma nova coluna
  @Mutation(() => Column)
  createColumn(
    @Args('title') title: string, //Esta linha serve para receber o título da nova coluna
  ): Column {
    return this.columnService.create(title);
  }
}

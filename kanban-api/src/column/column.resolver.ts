
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Column } from './column.entity';
import { ColumnService } from './column.service';

@Resolver(() => Column)
export class ColumnResolver {
  constructor(private readonly columnService: ColumnService) {}

  @Query(() => [Column], { name: 'columns' })
  async getColumns() {
    return this.columnService.findAllColumns();
  }

  @Query(() => Column, { name: 'column' })
  async getColumnById(@Args('id', { type: () => Int }) id: number) {
    return this.columnService.findColumnById(id);
  }

  @Mutation(() => Column)
  async createColumn(
    @Args('title') title: string,
    @Args('boardId', { type: () => Int }) boardId: number,
  ) {
    return this.columnService.createColumn(title, boardId);
  }

  @Mutation(() => Column)
  async updateColumn(
    @Args('id', { type: () => Int }) id: number,
    @Args('title') title: string,
  ) {
    return this.columnService.updateColumn(id, title);
  }

  @Mutation(() => Boolean)
  async deleteColumn(@Args('id', { type: () => Int }) id: number) {
    return this.columnService.deleteColumn(id);
  }
}

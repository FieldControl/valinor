import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ColumnService } from './column.service';
import { Column } from './dtos/column.model';
import { CreateColumn } from './dtos/column-create.input';
import { UpdateColumn } from './dtos/column-update.input';

@Resolver()
export class ColumnResolver {
  constructor(private service: ColumnService) { }

  @Query(() => [Column])
  async columns(): Promise<Column[]> {
    return await this.service.columns();
  }

  @Mutation(() => Column)
  async createColumn(
    @Args('body') body: CreateColumn,
  ): Promise<Column> {
    return await this.service.crate(body);
  }

  @Mutation(() => Column)
  async updateColumn(
    @Args('body') body: UpdateColumn,
  ): Promise<Column> {
    return await this.service.update(body);
  }

  @Mutation(() => Column)
  async deleteColumn(
    @Args('id') id: number,
  ): Promise<{ id: number }> {
    return await this.service.delete(id);
  }
}

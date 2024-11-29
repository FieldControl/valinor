import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ColumnService } from './column.service';
import { Column } from './dtos/column.model';
import { CreateColumn } from './dtos/column-create.input';

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
}

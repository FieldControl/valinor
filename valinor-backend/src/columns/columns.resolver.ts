import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ColumnsService } from './columns.service';
import { Column } from './columns.entity';

@Resolver(() => Column)
export class ColumnsResolver {
  constructor(private readonly columnsService: ColumnsService) {}

  @Query(() => [Column])
  columns() {
    return this.columnsService.findAll();
  }
}

import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/auth.guard';
import { ColumnTable } from './columns.entity';
import { ColumnsService } from './columns.service';
import { CreateColumnInput } from './dto/create-column.input';
import { UpdateColumnInput } from './dto/update-column.input';

@Resolver('Column')
export class ColumnsResolver {
  constructor(private columnService: ColumnsService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [ColumnTable])
  async columns(): Promise<ColumnTable[]> {
    const columns = await this.columnService.findAllColumns();
    return columns;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => ColumnTable)
  async column(@Args('id') id: string): Promise<ColumnTable> {
    const column = await this.columnService.findColumnById(id);

    console.log(column);

    return column;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ColumnTable)
  async createColumn(
    @Args('data') data: CreateColumnInput,
  ): Promise<ColumnTable> {
    const column = await this.columnService.createColumn(data);

    return column;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ColumnTable)
  async updateColumn(
    @Args('id') id: string,
    @Args('data') data: UpdateColumnInput,
  ): Promise<ColumnTable> {
    const column = this.columnService.updateColumn(id, data);

    return column;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteColumn(@Args('id') id: string): Promise<boolean> {
    const deleted = await this.columnService.deleteColumn(id);

    return deleted;
  }
}

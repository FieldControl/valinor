import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ColumnService } from './column.service';
import { Column } from './entities/column.entity';
import { CreateColumnInput } from './dto/create-column.input';
import { UpdateColumnInput } from './dto/update-column.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';

@Resolver(() => Column)
@UseGuards(GqlAuthGuard)
export class ColumnResolver {
  constructor(private readonly columnService: ColumnService) {}

  @Mutation(() => Column)
  createColumn(@Args('createColumnInput') createColumnInput: CreateColumnInput) {
    return this.columnService.create(createColumnInput);
  }

  @Mutation(() => Column)
  updateColumn(@Args('updateColumnInput') updateColumnInput: UpdateColumnInput) {
    return this.columnService.update(updateColumnInput.id, updateColumnInput);
  }

  @Mutation(() => Column)
  removeColumn(@Args('id', { type: () => Int }) id: number) {
    return this.columnService.remove(id);
  }

  @Query(() => [Column], { name: 'column' })
  findAll() {
    return this.columnService.findAll();
  }

  @Query(() => Column, { name: 'column' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.columnService.findOne(id);
  }
}

import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Column } from '../../domain/entities/column.entity';
import { CreateColumnInput } from '../../application/dto/columnDto/create-column.input';
import {
  UpdateColumnInput,
  UpdateColumnsInput,
} from '../../application/dto/columnDto/update-column.input';
import { ColumnService } from '@application/services/column.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@guard//auth.guard';

@Resolver(() => Column)
export class ColumnResolver {
  constructor(private readonly columnService: ColumnService) {}

  @Mutation(() => Column)
  @UseGuards(AuthGuard)
  createColumn(
    @Args('createColumnInput') createColumnInput: CreateColumnInput,
  ) {
    return this.columnService.create(createColumnInput);
  }

  @Query(() => [Column], { name: 'columns' })
  findAll() {
    return this.columnService.findAll();
  }

  @Query(() => Column, { name: 'column' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.columnService.findOne(id);
  }

  @Mutation(() => Column)
  @UseGuards(AuthGuard)
  updateColumn(
    @Args('updateColumnInput') updateColumnInput: UpdateColumnInput,
  ) {
    return this.columnService.update(updateColumnInput.id, updateColumnInput);
  }

  @Mutation(() => [Column])
  @UseGuards(AuthGuard)
  updateColumns(
    @Args('updateColumnsInput') updateColumnsInput: UpdateColumnsInput,
  ) {
    return this.columnService.updateMany(updateColumnsInput);
  }

  @Mutation(() => Column)
  @UseGuards(AuthGuard)
  removeColumn(@Args('id', { type: () => String }) id: string) {
    return this.columnService.remove(id);
  }
}

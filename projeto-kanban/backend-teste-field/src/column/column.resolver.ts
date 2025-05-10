import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ColumnService } from './column.service';
import { ColumnKanban } from './entities/column.entity';
import { CreateColumnKanbanInput } from './dto/create-column.input';
import { UpdateColumnKanbanInput } from './dto/update-column.input';
import { DeleteColumnKanbanInput } from './dto/delete-column.input';

@Resolver(() => ColumnKanban)
export class ColumnResolver {
  constructor(private readonly columnService: ColumnService) {}

  @Mutation(() => ColumnKanban)
  createColumn(@Args('createColumnInput') createColumnInput: CreateColumnKanbanInput) {
    return this.columnService.create(createColumnInput);
  }

  @Query(() => [ColumnKanban], { name: 'columns' })
  findAll() {
    return this.columnService.findAll();
  }

  @Query(() => ColumnKanban, { name: 'column' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.columnService.findOne(id);
  }

  @Mutation(() => ColumnKanban)
  updateColumn(@Args('updateColumnInput') updateColumnInput: UpdateColumnKanbanInput) {
    return this.columnService.update(updateColumnInput);
  }

  
  @Mutation(() => ColumnKanban)
  removeColumn(@Args('removeColumnInput') removeColumnInput: DeleteColumnKanbanInput) {
    return this.columnService.remove(removeColumnInput);
  }
}

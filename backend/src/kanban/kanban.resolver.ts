import { ColumnTaskCount } from './column-task-count.type';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Board } from './entities/board.entity';
import { KanbanColumn } from './entities/column.entity';
import { Task } from './entities/task.entity';

import { KanbanService } from './kanban.service';

import { CreateBoardInput } from './inputs/creat-board.input';
import { CreateColumnInput } from './inputs/creat-column.input';
import { CreateTaskInput } from './inputs/creat-task.input';
import { MoveTaskInput } from './inputs/move-task.input';

@Resolver()
export class KanbanResolver {
  constructor(private readonly kanban: KanbanService) {}

  // --- BOARDS ---

  @Query(() => [Board])
  boards() {
    return this.kanban.getBoards();
  }

  @Mutation(() => Board)
  createBoard(@Args('input') input: CreateBoardInput) {
    return this.kanban.createBoard(input);
  }

  // --- COLUMNS ---

  @Query(() => [KanbanColumn])
  columnsByBoard(@Args('boardId', { type: () => ID }) boardId: string) {
    return this.kanban.getColumnsByBoard(boardId);
  }

  @Mutation(() => KanbanColumn)
  createColumn(@Args('input') input: CreateColumnInput) {
    return this.kanban.createColumn(input);
  }

  // --- TASKS ---

  @Query(() => [Task], { name: 'tasks' }) 
  findAllTasks() {
    return this.kanban.getTasks();
  }

  @Query(() => [Task])
  tasksByColumn(@Args('columnId', { type: () => ID }) columnId: string) {
    return this.kanban.getTasksByColumn(columnId);
  }

  @Mutation(() => Task)
  createTask(@Args('input') input: CreateTaskInput) {
    return this.kanban.createTask(input);
  }

  @Mutation(() => Task)
  moveTask(@Args('input') input: MoveTaskInput) {
    return this.kanban.moveTask(input);
  }

  // --- ESTATÍSTICAS (O pedaço que faltava!) ---

  @Query(() => [ColumnTaskCount])
  taskCountsByBoard(@Args('boardId', { type: () => ID }) boardId: string) {
    return this.kanban.getTaskCounts(boardId);
  }
} 
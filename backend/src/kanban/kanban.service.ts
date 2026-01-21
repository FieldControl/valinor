import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Board } from './entities/board.entity';
import { KanbanColumn } from './entities/column.entity';
import { Task } from './entities/task.entity';

import { CreateBoardInput } from './inputs/creat-board.input';
import { CreateColumnInput } from './inputs/creat-column.input';
import { CreateTaskInput } from './inputs/creat-task.input';
import { MoveTaskInput } from './inputs/move-task.input';

@Injectable()
export class KanbanService {
  constructor(
    @InjectRepository(Board) private boardsRepo: Repository<Board>,
    @InjectRepository(KanbanColumn) private colsRepo: Repository<KanbanColumn>,
    @InjectRepository(Task) private tasksRepo: Repository<Task>,
  ) {}

  // --- BOARDS ---
  createBoard(input: CreateBoardInput) {
    const board = this.boardsRepo.create({ name: input.name });
    return this.boardsRepo.save(board);
  }

  getBoards() {
    return this.boardsRepo.find({ 
      relations: ['columns', 'columns.tasks'] 
    });
  }

  async getBoard(id: string) {
    const board = await this.boardsRepo.findOne({ 
      where: { id },
      relations: ['columns'] 
    });
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  // --- COLUMNS ---
  async createColumn(input: CreateColumnInput) {
    const board = await this.getBoard(input.boardId);
    const col = this.colsRepo.create({ 
      name: input.name, 
      order: input.order, 
      board 
    });
    return this.colsRepo.save(col);
  }

  getColumnsByBoard(boardId: string) {
    return this.colsRepo.find({
      where: { board: { id: boardId } },
      order: { order: 'ASC' },
      relations: ['tasks'],
    });
  }

  // --- TASKS ---
  
  getTasks() {
    return this.tasksRepo.find({ 
      relations: ['column'],
      order: { createdAt: 'DESC' }
    });
  }

  async createTask(input: CreateTaskInput) {
    const col = await this.colsRepo.findOne({ where: { id: input.columnId } });
    if (!col) throw new NotFoundException('Column not found');

    const task = this.tasksRepo.create({
      title: input.title,
      description: input.description,
      order: input.order,
      dueDate: input.dueDate,
      column: col,
    });

    return this.tasksRepo.save(task);
  }

  getTasksByColumn(columnId: string) {
    return this.tasksRepo.find({
      where: { column: { id: columnId } },
      order: { order: 'ASC' },
    });
  }

  async moveTask(input: MoveTaskInput) {
    const task = await this.tasksRepo.findOne({
      where: { id: input.taskId },
      relations: { column: true },
    });
    if (!task) throw new NotFoundException('Task not found');

    const toCol = await this.colsRepo.findOne({ where: { id: input.toColumnId } });
    if (!toCol) throw new NotFoundException('Target column not found');

    task.column = toCol;
    task.order = input.newOrder;

    return this.tasksRepo.save(task);
  }

  // --- ESTATÍSTICAS (PARA O GRÁFICO) ---
  
  async getTaskCounts(boardId: string) {
    const columns = await this.colsRepo.find({
      where: { board: { id: boardId } },
      relations: ['tasks'],
    });

    return columns.map(col => ({
      columnName: col.name,
      count: (col.tasks || []).length,
    }));
  }
  // ... (outros métodos)

  async deleteTask(id: string) {
    const result = await this.tasksRepo.delete(id);
    // Retorna true se deletou, false se não achou
    return (result.affected || 0) > 0;
  }
}
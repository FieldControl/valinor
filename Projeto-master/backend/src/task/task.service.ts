import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  // Buscar todas as tarefas
  findAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  // Criar uma nova tarefa
  create(task: Partial<Task>): Promise<Task> {
    const newTask = this.taskRepository.create(task);
    return this.taskRepository.save(newTask);
  }

  // Atualizar uma tarefa existente
  async update(id: number, task: Partial<Task>): Promise<Task> {
    const existingTask = await this.taskRepository.findOne({ where: { id } });
    if (!existingTask) {
      throw new Error(`Tarefa com ID ${id} não encontrada.`);
    }

    await this.taskRepository.update(id, task);
    const updatedTask = await this.taskRepository.findOne({ where: { id } });
    if (!updatedTask) {
      throw new Error(`Tarefa com ID ${id} não encontrada após a atualização.`);
    }
    return updatedTask;
  }

  // Excluir uma tarefa
  async delete(id: number): Promise<void> {
    const existingTask = await this.taskRepository.findOne({ where: { id } });
    if (!existingTask) {
      throw new Error(`Tarefa com ID ${id} não encontrada.`);
    }

    await this.taskRepository.delete(id);
  }

  // Adiciona comentário
  async addComment(taskId: number, content: string) {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) throw new Error(`Tarefa com ID ${taskId} não encontrada.`);

    const newComment = {
      id: Date.now(),
      content,
    };

    task.comments.push(newComment);
    return this.taskRepository.save(task);
  }

  // Edita comentário
  async editComment(taskId: number, commentId: number, newContent: string) {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) throw new Error(`Tarefa com ID ${taskId} não encontrada.`);

    const comment = task.comments.find((c) => c.id === commentId);
    if (!comment)
      throw new Error(`Comentário com ID ${commentId} não encontrado.`);

    comment.content = newContent;
    return this.taskRepository.save(task);
  }
}

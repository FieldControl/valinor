import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Task } from 'src/interfaces/task.interface';
import { Archive } from 'src/interfaces/archive.interface';
import { Project } from 'src/interfaces/project.interface';
import { Column } from 'src/interfaces/column.interface';

@Injectable()
export class TaskService {
  constructor(
    @Inject('PROJECT_MODEL') private projectModel: Model<Project>,
    @Inject('COLUMN_MODEL') private columnModel: Model<Column>,
    @Inject('TASK_MODEL') private taskModel: Model<Task>,
    @Inject('ARCHIVE_MODEL') private archiveModel: Model<Archive>,
  ) {}

  async getAllTasks(
    projectId: string,
    columnId: string,
  ): Promise<Task[] | { message: string }> {
    try {
      if (!projectId || !columnId) {
        return {
          message: 'Requer um ID',
        };
      }
      const tasks = await this.taskModel
        .find({ _id_project: projectId, _id_column: columnId })
        .exec();
      console.log(tasks);
      if (tasks.length === 0) {
        return { message: `Não existe tasks na coluna: ${columnId}` };
      }
    } catch (error) {
      return { message: `Ocorreu um erro: ${error}` };
    }
  }

  async getByIdTask(taskId: string): Promise<Task | { message: string }> {
    try {
      const task = await this.taskModel.findById(taskId);
      if (!task) {
        return { message: `Task não encontrada` };
      }

      return task;
    } catch (error) {
      return { message: `Ocorreu um erro: ${error}` };
    }
  }

  async createTask(body: Task): Promise<{ message: string }> {
    const createTask = new this.taskModel(body);
    try {
      const projectSearch = await this.projectModel
        .findById(body._id_project)
        .exec();
      const columnSearch = await this.columnModel
        .findById(body._id_column)
        .exec();

      if (
        (!projectSearch && !columnSearch) ||
        (!projectSearch && columnSearch) ||
        (projectSearch && !columnSearch)
      ) {
        return {
          message: `Task não pode ser criada, projeto: ${body._id_project} não existe ou coluna: ${body._id_column} não existe`,
        };
      }

      const numberOfTasks = await this.taskModel.countDocuments();
      if (numberOfTasks >= 12) {
        return {
          message: `Task não pode ser criada, número maximo de tasks atingida`,
        };
      }

      await createTask.save();

      return { message: `Task criada!` };
    } catch (error) {
      return { message: `Ocorreu um erro: ${error}` };
    }
  }

  async updateTask(taskId: string, body: Task): Promise<{ message: string }> {
    try {
      const taskExists = await this.taskModel.findById(taskId);

      if (!taskExists) {
        return { message: `Task não encontrada` };
      }

      await this.taskModel.updateOne(
        {
          _id: taskId,
        },
        { title: body.title, description: body.description },
      );

      return { message: `Task editada` };
    } catch (error) {
      return { message: `Ocorreu um erro: ${error}` };
    }
  }

  async archiveTask(taskId: string): Promise<{ message: string }> {
    try {
      const task = await this.taskModel.findById({
        _id: taskId,
      });
      const archivedTask = new this.archiveModel({
        _id: task._id,
        _id_project: task._id_project,
        _id_column: task._id_column,
        title: task.title,
        description: task.description,
        archived: true,
      });
      await this.taskModel.deleteOne({
        _id: taskId,
      });

      await archivedTask.save();

      return { message: 'Task arquivada' };
    } catch (error) {
      return { message: `Ocorreu um erro: ${error}` };
    }
  }

  async recoveryArchivedTask(taskId: string): Promise<{ message: string }> {
    try {
      const task = await this.archiveModel.findById({
        _id: taskId,
      });
      const recoveryTask = new this.taskModel({
        _id: task._id,
        _id_project: task._id_project,
        _id_column: task._id_column,
        title: task.title,
        description: task.description,
        archived: false,
      });

      await this.archiveModel.deleteOne({
        _id: taskId,
      });

      await recoveryTask.save();

      return { message: `Task recuperada` };
    } catch (error) {
      return { message: `Ocorreu um erro: ${error}` };
    }
  }

  async deleteTask(taskId: string): Promise<{ message: string }> {
    try {
      const taskExists = await this.taskModel.findById(taskId);

      if (!taskExists) {
        return { message: `Task não encontrada` };
      }

      await this.taskModel.deleteOne({
        _id: taskId,
      });

      return { message: `Task deletada` };
    } catch (error) {
      return { message: `Ocorreu um erro: ${error}` };
    }
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Task } from 'src/interfaces/task.interface';
import { Archive } from 'src/interfaces/archive.interface';

@Injectable()
export class TaskService {
  constructor(
    @Inject('TASK_MODEL') private taskModel: Model<Task>,
    @Inject('ARCHIVE_MODEL') private archiveModel: Model<Archive>,
  ) {}

  async getAllTasks(projectId: string, columnId: string): Promise<Task[]> {
    return await this.taskModel
      .find({ _id_project: projectId, _id_column: columnId })
      .exec();
  }

  async getByIdTask(projectId: string, taskId: string): Promise<Task> {
    return await this.taskModel
      .findOne({ _id_project: projectId, _id: taskId })
      .exec();
  }

  async createTask(body: Task) {
    const createTask = new this.taskModel(body);
    await createTask.save();
    return this.taskModel.find().exec();
  }

  async updateTask(taskId: string, body: Task): Promise<Task[]> {
    await this.taskModel.updateOne(
      {
        _id: taskId,
      },
      { title: body.title, description: body.description },
    );
    return this.taskModel.find().exec();
  }

  async archiveTask(taskId: string): Promise<Archive[]> {
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
    return this.archiveModel.find().exec();
  }

  async recoveryArchivedTask(taskId: string): Promise<Archive[]> {
    const task = await this.archiveModel.findById({
      _id: taskId,
    });
    await this.archiveModel.deleteOne({
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
    await recoveryTask.save();
    return this.taskModel.find().exec();
  }

  async deleteTask(taskId: string): Promise<Task[]> {
    await this.taskModel.deleteOne({
      _id: taskId,
    });
    return this.taskModel.find().exec();
  }
}

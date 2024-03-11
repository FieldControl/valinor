import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Project } from '../../interfaces/project.interface';
import { Column } from 'src/interfaces/column.interface';
import { Task } from 'src/interfaces/task.interface';
import { HandleMessage } from 'src/interfaces/handleMessage.interface';

@Injectable()
export class ProjectService {
  constructor(
    @Inject('PROJECT_MODEL') private projectModel: Model<Project>,
    @Inject('COLUMN_MODEL') private columnModel: Model<Column>,
    @Inject('TASK_MODEL') private taskModel: Model<Task>,
  ) {}

  async createProject(body: Project): Promise<HandleMessage> {
    const createProject = new this.projectModel(body);
    try {
      const numberOfProjects = await this.projectModel.countDocuments();

      if (numberOfProjects >= 4) {
        return {
          message: 'Atingiu o numero maximo de projetos',
          code: 400,
        };
      }

      await createProject.save();

      return {
        message: `Projeto ${body.title} criado!`,
        code: 200,
      };
    } catch (error) {
      return {
        message: `Ocorreu um erro: ${error}`,
        code: 500,
      };
    }
  }

  async getAllProjects(): Promise<Project[] | HandleMessage> {
    try {
      return await this.projectModel.find().exec();
    } catch (error) {
      return {
        message: `Ocorreu um erro: ${error}`,
        code: 500,
      };
    }
  }

  async getByIdProject(projectId: string): Promise<Project | HandleMessage> {
    try {
      const projectExists = await this.projectModel.findById(projectId);
      if (!projectExists) {
        return { message: `Projeto não encontrada`, code: 400 };
      }

      return this.projectModel.findById(projectId).exec();
    } catch (error) {
      return {
        message: `Ocorreu um erro: ${error}`,
        code: 500,
      };
    }
  }

  async renameProject(
    projectId: string,
    body: Project,
  ): Promise<HandleMessage> {
    if (!body.title) {
      return {
        message: 'Requer um titulo',
        code: 400,
      };
    }

    try {
      const projectExists = await this.projectModel.findById(projectId);
      if (!projectExists) {
        return { message: `Projeto não encontrada`, code: 400 };
      }
      await this.projectModel.updateOne(
        { _id: projectId },
        { title: body.title },
      );

      return {
        message: `Projeto renomeado para ${body.title}!`,
        code: 200,
      };
    } catch (error) {
      return {
        message: `Ocorreu um erro: ${error}`,
        code: 500,
      };
    }
  }

  async deleteProject(projectId: string): Promise<HandleMessage> {
    try {
      const projectExists = await this.projectModel.findById(projectId);
      if (!projectExists) {
        return { message: `Projeto não encontrada`, code: 400 };
      }

      await this.projectModel.deleteOne({ _id: projectId });
      await this.columnModel.deleteMany({ _id_project: projectId });
      await this.taskModel.deleteMany({ _id_project: projectId });

      return {
        message: `Projeto id: ${projectId} deletado com sucesso!`,
        code: 200,
      };
    } catch (error) {
      return {
        message: `Ocorreu um erro: ${error}`,
        code: 500,
      };
    }
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Project } from '../../interfaces/project.interface';
import { Column } from 'src/interfaces/column.interface';
import { Task } from 'src/interfaces/task.interface';

@Injectable()
export class ProjectService {
  constructor(
    @Inject('PROJECT_MODEL') private projectModel: Model<Project>,
    @Inject('COLUMN_MODEL') private columnModel: Model<Column>,
    @Inject('TASK_MODEL') private taskModel: Model<Task>,
  ) {}

  async createProject(body: Project): Promise<{ message: string }> {
    const createProject = new this.projectModel(body);
    try {
      const numberOfProjects = await this.projectModel.countDocuments();

      if (numberOfProjects >= 4) {
        return {
          message: 'Atingiu o numero maximo de projetos',
        };
      }

      await createProject.save();

      return {
        message: `Projeto ${body.title} criado!`,
      };
    } catch (error) {
      return {
        message: `Ocorreu um erro: ${error}`,
      };
    }
  }

  async getAllProjects(): Promise<Project[] | { message: string }> {
    try {
      return await this.projectModel.find().exec();
    } catch (error) {
      return {
        message: `Ocorreu um erro: ${error}`,
      };
    }
  }

  async getByIdProject(
    projectId: string,
  ): Promise<Project | { message: string }> {
    try {
      const projectExists = await this.projectModel.findById(projectId);
      if (!projectExists) {
        return { message: `Projeto não encontrada` };
      }

      return this.projectModel.findById(projectId).exec();
    } catch (error) {
      return {
        message: `Ocorreu um erro: ${error}`,
      };
    }
  }

  async renameProject(
    projectId: string,
    body: Project,
  ): Promise<{ message: string }> {
    if (!body.title) {
      return {
        message: 'Requer um titulo',
      };
    }

    try {
      const projectExists = await this.projectModel.findById(projectId);
      if (!projectExists) {
        return { message: `Projeto não encontrada` };
      }
      await this.projectModel.updateOne(
        { _id: projectId },
        { title: body.title },
      );

      return {
        message: `Projeto renomeado para ${body.title}!`,
      };
    } catch (error) {
      return {
        message: `Ocorreu um erro: ${error}`,
      };
    }
  }

  async deleteProject(projectId: string): Promise<{ message: string }> {
    try {
      const projectExists = await this.projectModel.findById(projectId);
      if (!projectExists) {
        return { message: `Projeto não encontrada` };
      }

      await this.projectModel.deleteOne({ _id: projectId });
      await this.columnModel.deleteMany({ _id_project: projectId });
      await this.taskModel.deleteMany({ _id_project: projectId });

      return {
        message: `Projeto id: ${projectId} deletado com sucesso!`,
      };
    } catch (error) {
      return {
        message: `Ocorreu um erro: ${error}`,
      };
    }
  }
}

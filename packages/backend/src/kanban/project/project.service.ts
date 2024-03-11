import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Project } from '../../interfaces/project.interface';

@Injectable()
export class ProjectService {
  constructor(@Inject('PROJECT_MODEL') private projectModel: Model<Project>) {}

  async createProject(project: Project): Promise<{ message: string }> {
    const createProject = new this.projectModel(project);
    const numberOfProjects = await this.projectModel.countDocuments();
    if (numberOfProjects >= 4) {
      return {
        message: 'Atingiu o numero maximo de projetos',
      };
    }
    try {
      await createProject.save();
      return {
        message: `Projeto ${project.title} criado!`,
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

  async getByIdProject(id: string): Promise<Project | { message: string }> {
    try {
      return this.projectModel.findById(id).exec();
    } catch (error) {
      return {
        message: `Ocorreu um erro: ${error}`,
      };
    }
  }

  async renameProject(id: string, body: Project): Promise<{ message: string }> {
    try {
      await this.projectModel.updateOne({ _id: id }, { title: body.title });
      return {
        message: `Projeto renomeado para ${body.title}!`,
      };
    } catch (error) {
      return {
        message: `Ocorreu um erro: ${error}`,
      };
    }
  }

  async deleteProject(id: string): Promise<{ message: string }> {
    try {
      await this.projectModel.deleteOne({ _id: id });
      return {
        message: `Projeto id: ${id} deletado com sucesso!`,
      };
    } catch (error) {
      return {
        message: `Ocorreu um erro: ${error}`,
      };
    }
  }
}

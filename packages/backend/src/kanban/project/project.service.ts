import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Project } from '../../interfaces/project.interface';

@Injectable()
export class ProjectService {
  constructor(@Inject('PROJECT_MODEL') private projectModel: Model<Project>) {}

  async createProject(project: Project): Promise<Project[]> {
    const createProject = new this.projectModel(project);
    await createProject.save();
    return this.projectModel.find().exec();
  }

  async getAllProjects(): Promise<Project[]> {
    return await this.projectModel.find().exec();
  }

  async getByIdProject(id: string): Promise<Project> {
    return this.projectModel.findById(id).exec();
  }

  async renameProject(id: string, name: string): Promise<Project[]> {
    await this.projectModel.updateOne({ _id: id }, { title: name });
    return this.projectModel.find().exec();
  }

  async deleteProject(id: string): Promise<Project[]> {
    await this.projectModel.deleteOne({ _id: id });
    return this.projectModel.find().exec();
  }
}

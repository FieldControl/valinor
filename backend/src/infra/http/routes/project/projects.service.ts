import { Injectable } from '@nestjs/common';
import { Prisma, Project } from '@prisma/client';
import { InvalidDeleteProjectError } from 'src/core/errors/invalid-delete-project-error';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async createProject(
    data: Prisma.ProjectUncheckedCreateInput,
  ): Promise<Project> {
    const projects = await this.prisma.project.create({
      data,
    });

    return projects;
  }

  async getProjectById(id: string) {
    const task = await this.prisma.project.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        Column: {
          select: {
            id: true,
            title: true,
            projectId: true,
            Task: {
              select: {
                id: true,
                title: true,
                columnId: true,
                projectId: true,
                description: true,
                archived: true,
              },
            },
            Archive: {
              select: {
                id: true,
                title: true,
                columnId: true,
                projectId: true,
                description: true,
                archived: true,
              },
            },
          },
        },
      },
    });

    return task;
  }

  async getAllProjects(userId: string) {
    const projects = await this.prisma.project.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        title: true,
        isTemplate: true,
      },
    });

    return projects;
  }

  async deleteProjectById(id: string) {
    try {
      const project = await this.prisma.project.delete({
        where: {
          id,
        },
      });

      return project;
    } catch (_) {
      throw new InvalidDeleteProjectError();
    }
  }

  async updateProjectById(
    id: string,
    data: Prisma.ProjectUncheckedUpdateInput,
  ): Promise<Project> {
    const project = await this.prisma.project.update({
      where: {
        id,
      },
      data,
    });

    return project;
  }
}

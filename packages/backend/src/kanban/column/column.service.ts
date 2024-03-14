import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Column } from 'src/interfaces/column.interface';
import { HandleMessage } from 'src/interfaces/handleMessage.interface';
import { Project } from 'src/interfaces/project.interface';
import { Task } from 'src/interfaces/task.interface';

@Injectable()
export class ColumnService {
  constructor(
    @Inject('PROJECT_MODEL') private projectModel: Model<Project>,
    @Inject('COLUMN_MODEL') private columnModel: Model<Column>,
    @Inject('TASK_MODEL') private taskModel: Model<Task>,
  ) {}

  async createColumn(body: Column): Promise<HandleMessage> {
    try {
      const createColumn = new this.columnModel(body);
      const projectSearch = await this.projectModel
        .findById(body._id_project)
        .exec();

      if (!projectSearch) {
        return {
          message: `Coluna não pode ser criada, projeto: ${body._id_project} não existe.`,
          code: 400,
        };
      }

      const numberOfColumns = await this.columnModel.countDocuments();
      if (numberOfColumns >= 10) {
        return {
          message: `Coluna não pode ser criada, número maximo de colunas atingida`,
          code: 400,
        };
      }

      await createColumn.save();

      return { message: `Coluna criada!`, code: 200 };
    } catch (error) {
      return { message: `Ocorreu um erro: ${error}`, code: 500 };
    }
  }

  async getByIdColumns(columnId: string): Promise<Column | HandleMessage> {
    try {
      const column = await this.columnModel.findById({
        _id: columnId,
      });

      if (!column) {
        return { message: `Coluna não encontrada`, code: 400 };
      }
      return column;
    } catch (error) {
      return { message: `Ocorreu um erro: ${error}`, code: 500 };
    }
  }

  async getAllColumns(projectId: string): Promise<Column[] | HandleMessage> {
    try {
      if (!projectId) {
        return {
          message: 'Requer um ID',
          code: 400,
        };
      }
      const columns = await this.columnModel
        .find({ _id_project: projectId })
        .exec();

      if (columns.length === 0) {
        return {
          message: `Não existe colunas no projeto id: ${projectId}`,
          code: 400,
        };
      }

      return columns;
    } catch (error) {
      return {
        message: `Ocorreu um erro: ${error}}`,
        code: 500,
      };
    }
  }

  async renameColumn(columnId: string, body: Column): Promise<HandleMessage> {
    if (!body.title) {
      return { message: `Requer um titulo`, code: 400 };
    }

    try {
      const columnExists = await this.columnModel.findById(columnId);

      if (!columnExists) {
        return { message: `Coluna não encontrada`, code: 400 };
      }

      await this.columnModel.updateOne(
        { _id: columnId },
        { title: body.title },
      );

      return { message: `Coluna renomeada!`, code: 200 };
    } catch (error) {
      return {
        message: `Ocorreu um erro: ${error}`,
        code: 500,
      };
    }
  }

  async deleteColumn(columnId: string): Promise<HandleMessage> {
    try {
      const columnExists = await this.columnModel.findById(columnId);
      if (!columnExists) {
        return { message: `Coluna não encontrada`, code: 400 };
      }

      await this.columnModel.deleteOne({ _id: columnId });
      await this.taskModel.deleteMany({ _id_column: columnId });

      return {
        message: `Coluna deletada!`,
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

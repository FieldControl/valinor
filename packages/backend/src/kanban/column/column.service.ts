import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Column } from 'src/interfaces/column.interface';

@Injectable()
export class ColumnService {
  constructor(@Inject('COLUMN_MODEL') private columnModel: Model<Column>) {}

  async createColumn(body: Column): Promise<any> {
    new this.columnModel(body).save();
    return this.columnModel.find().exec();
  }

  async getByIdColumns(projectId: string, columnId: string): Promise<any> {
    return await this.columnModel
      .findOne({ _id_project: projectId, _id: columnId })
      .exec();
  }

  async getAllColumns(projectId: string): Promise<any> {
    return await this.columnModel.find({ _id_project: projectId }).exec();
  }

  async renameColumn(columnId: string, body: Column): Promise<Column[]> {
    await this.columnModel.updateOne(
      { _id: columnId, _id_project: body._id_project },
      { title: body.title },
    );
    return this.columnModel.find().exec();
  }

  async deleteColumn(columnId: string, projectId: string): Promise<Column[]> {
    await this.columnModel.deleteOne({ _id: columnId, _id_project: projectId });
    return this.columnModel.find().exec();
  }
}

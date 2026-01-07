import { Injectable } from '@nestjs/common';
import { CreateColumnInput } from './dto/create-column.input';
import { UpdateColumnInput } from './dto/update-column.input';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ColumnService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(input: CreateColumnInput) {
    const lastPosition = await this.prismaService.column.aggregate({
      where: { fk_boardId: input.boardId },
      _max: { it_position: true },
    });

    const column = await this.prismaService.column.create({
      data: {
        vc_name: input.name,
        fk_boardId: input.boardId,
        it_position: (lastPosition._max.it_position ?? 0) + 1,
      },
    });

    return {
      id: column.sr_id,
      name: column.vc_name,
      boardId: column.fk_boardId,
      position: column.it_position,
    };
  }


  findAll() {
    return `This action returns all column`;
  }

  findOne(id: number) {
    return `This action returns a #${id} column`;
  }

  async update(id: number, updateColumnInput: UpdateColumnInput) {
    const column = await this.prismaService.column.update({
      where: { sr_id: id },
      data: {
        ...(updateColumnInput.name && { vc_name: updateColumnInput.name }),
      },
    });

    return {
      id: column.sr_id,
      name: column.vc_name,
      boardId: column.fk_boardId,
      position: column.it_position,
    };
  }

  async remove(id: number) {
    const column = await this.prismaService.column.delete({
      where: { sr_id: id },
    });

    return {
      id: column.sr_id,
      name: column.vc_name,
      boardId: column.fk_boardId,
      position: column.it_position,
    };
  }

}

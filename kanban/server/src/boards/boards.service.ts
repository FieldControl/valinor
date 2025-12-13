import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) { }

  findAll() {
    return this.prisma.board.findMany();
  }

  findOne(id: string) {
    return this.prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            cards: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });
  }

  async findOneOrThrow(id: string) {
    const board = await this.findOne(id);
    if (!board) {
      throw new NotFoundException('Quadro não encontrado!')
    }
  }

  create(dto: CreateBoardDto) {
    return this.prisma.board.create({
      data: { name: dto.name }
    });
  }

  async update(id: string, dto: UpdateBoardDto){
    await this.findOneOrThrow(id);
    return this.prisma.board.update({
      where: { id },
      data: {
        ...(dto.name != undefined && { name: dto.name})
      }
    });
  }

  async remove(id: string) {
    await this.findOneOrThrow(id);
    return this.prisma.board.delete({
      where: { id }
    });
  }
}

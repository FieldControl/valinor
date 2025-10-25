import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) { }

  /**
  * Cria uma nova coluna.
  * Calcula automaticamente a posição como a próxima após a última coluna existente.
  * @param createColumnDto Dados da coluna a ser criada.
  * @returns A coluna criada com sua posição.
  */
  async create(sessionId: string, createColumnDto: CreateColumnDto) {
    const lastColumn = await this.prisma.column.findFirst({
      select: { position: true },
      orderBy: { position: 'desc' },
    });
    const nextPosition = (lastColumn?.position ?? 0) + 1;
    return this.prisma.column.create({
      data: { ...createColumnDto, position: nextPosition, sessionId, },
    });
  }

  /**
  * Cria múltiplas colunas em batch.
  * Calcula posições sequenciais após a última coluna existente.
  * @param columnsData Array de dados das colunas.
  * @returns Array das colunas criadas com posições definidas.
  */
  async createMany(sessionId: string, columnsData: CreateColumnDto[]) {
    const lastColumn = await this.prisma.column.findFirst({
      select: { position: true },
      orderBy: { position: 'desc' },
    });

    const nextPosition = lastColumn?.position ?? 0;

    const colsWithPosition: Prisma.ColumnCreateInput[] = columnsData.map((columns, i) => {
      return {
        ...columns,
        sessionId,
        position: (nextPosition + i) + 1
      };
    });

    await this.prisma.column.createMany({ data: colsWithPosition })

    const newColumns = await this.prisma.column.findMany({
      where: {
        sessionId,
        position: { in: colsWithPosition.map(col => col.position )},
      },
      orderBy: { position: 'asc' },
    });

    return newColumns;
  }

  /**
 * Lista todas as colunas incluindo os cards relacionados.
 * Os cards são ordenados pela posição ascendente.
 * @returns Array de colunas com seus cards.
 */
  async listWithCards(sessionId: string) {
    return await this.prisma.column.findMany({
      where: { sessionId },
      include: { cards: { orderBy: { position: 'asc' } } }
    });
  }

  /**
   * Atualiza uma coluna existente.
   * @param id ID da coluna a ser atualizada.
   * @param updateColumnDto Dados a serem atualizados.
   * @returns A coluna atualizada.
   */
  async update(id: number, updateColumnDto: UpdateColumnDto) {
    return await this.prisma.column.update({
      where: { id },
      data: updateColumnDto
    });
  }

  /**
 * Deleta uma coluna pelo ID.
 * @param id ID da coluna a ser deletada.
 * @returns Mensagem de confirmação da exclusão com o título da coluna.
 */
  async delete(id: number) {
    const response = await this.prisma.column.delete({ where: { id } });
    return { message: `Column [${response.title}] has been successfully deleted` };
  }

  /**
   * Deleta todas as colunas.
   * @returns Resultado da operação ou mensagem caso não existam colunas.
   */
  async deleteAll(sessionId: string) {
    const result = await this.prisma.column.deleteMany({ where: { sessionId } });
    if (result.count === 0) return 'There are no columns to delete';
    return result
  }
}

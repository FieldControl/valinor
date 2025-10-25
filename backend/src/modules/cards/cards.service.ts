import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Cria um novo card.
   * Calcula a posição automaticamente como a próxima posição após o último card existente.
   * @param createCardDto Dados do card a ser criado.
   * @returns O card recém-criado, incluindo sua posição.
   */
  async create(sessionId: string, createCardDto: CreateCardDto) {
    const lastCard = await this.prisma.card.findFirst({
      select: { position: true },
      orderBy: { position: 'desc' },
    });
    const nextPosition = (lastCard?.position ?? 0) + 1
    return this.prisma.card.create({
      data: { ...createCardDto, position: nextPosition, sessionId}
    });
  }

  /**
 * Cria múltiplos cards de uma vez.
 * Calcula posições automaticamente, sequenciais após o último card existente.
 * @param cards Array de cards a serem criados.
 * @returns Array dos cards criados com suas posições.
 */
  async createMany(sessionId: string, cards: CreateCardDto[]) {
    
    const lastCard = await this.prisma.card.findFirst({
      select: { position: true },
      orderBy: { position: 'desc' },
    });
    const nextPosition = lastCard?.position ?? 0
    const newCards = cards.map((card, i) => ({
      ...card,
      sessionId,
      position: nextPosition + i + 1
    }));
    await this.prisma.card.createMany({ data: newCards });
    return newCards
  }

  /**
  * Atualiza um card existente pelo ID.
  * @param id ID do card a ser atualizado.
  * @param updateCardDto Dados a serem atualizados.
  * @returns O card atualizado.
  */
  async update(id: number, updateCardDto: UpdateCardDto) {
    return this.prisma.card.update({ where: { id }, data: updateCardDto });
  }

  /**
   * Deleta um card pelo ID.
   * @param id ID do card a ser deletado.
   * @returns Mensagem de confirmação da exclusão.
   */
  async delete(id: number) {
    await this.prisma.card.delete({ where: { id } });
    return { message: `Card with ID [${id}] has been successfully deleted` };
  }
}

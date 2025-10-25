import { Injectable } from '@nestjs/common';
import { CardPriority } from '@prisma/client';
import { ToolSet, tool } from 'ai';
import { z } from 'zod';
import { CardsService } from '../../cards/cards.service';
import { CreateCardDto } from '../../cards/dto/create-card.dto';
import { ColumnsService } from '../../columns/columns.service';


@Injectable()
export class ToolsService {
  tools: ToolSet;

  constructor(
    private cardsService: CardsService,
    private columnsService: ColumnsService
  ) { }

  /**
 * Configura ferramentas (tools) para interação do modelo.
 * Cada ferramenta representa uma ação no sistema, como criar coluna, criar card ou deletar.
 */


  getTools(sessionId: string): ToolSet {
    return {
      getInfos: tool({
        description: 'Get columns and cards informations',
        parameters: z.object({}),
        execute: async () => await this.columnsService.listWithCards(sessionId),
      }),
      createCol: tool({
        description: 'Create a single new column',
        parameters: z.object({ title: z.string().describe('Column title') }),
        execute: async ({ title }) => await this.columnsService.create(sessionId, { title }),
      }),
      createMultipleCols: tool({
        description: 'Create multiple columns',
        parameters: z.object({
          columns: z.array(z.object({ title: z.string().describe('Column title') })),
        }),
        execute: async ({ columns }) => await this.columnsService.createMany(sessionId, columns),
      }),
      createCard: tool({
        description: 'Create a single new card',
        parameters: z.object({
          title: z.string().describe('Card title'),
          priority: z.nativeEnum(CardPriority).describe('Card Priority'),
          columnId: z.number().describe('Column ID')
        }),
        execute: async ({ columnId, priority, title }) => {
          await this.cardsService.create(sessionId, { columnId, title, priority });
        },
      }),
      createMultipleCards: tool({
        description: 'Create multiple cards (requires existing columns)',
        parameters: z.object({
          cards: z.array(
            z.object({
              title: z.string(),
              priority: z.nativeEnum(CardPriority),
              columnId: z.number(),
            })
          )
        }),
        execute: async ({ cards }: { cards: CreateCardDto[] }) => {
          if (!Array.isArray(cards)) return 'Cards are not in correct format.';
          return await this.cardsService.createMany(sessionId, cards);
        },
      }),
      deleteAllColumns: tool({
        description: 'Delete all columns',
        parameters: z.object({}),
        execute: async () => await this.columnsService.deleteAll(sessionId),
      }),
    };
  }

}

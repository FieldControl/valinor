import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Card, CreateCardInput, UpdateCardInput, MoveCardInput } from '../types/card.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CardService {
  private readonly logger = new Logger(CardService.name);

  constructor(private supabaseService: SupabaseService) {}

  async createCard(input: CreateCardInput): Promise<Card> {
    const client = this.supabaseService.getClient();
    const id = uuidv4();
    const now = new Date().toISOString();

    // Get the next position if not provided
    let position = input.position;
    if (position === undefined) {
      const { data: existingCards } = await client
        .from('cards')
        .select('position')
        .eq('column_id', input.column_id)
        .order('position', { ascending: false })
        .limit(1);

      position = existingCards && existingCards.length > 0 
        ? existingCards[0].position + 1 
        : 0;
    }

    const cardData = {
      id,
      title: input.title,
      description: input.description || null,
      column_id: input.column_id,
      position,
      color: input.color || null,
      due_date: input.due_date || null,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await client
      .from('cards')
      .insert(cardData)
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to create card', error);
      throw new Error(`Failed to create card: ${error.message}`);
    }

    return data;
  }

  async getCardsByColumnId(columnId: string): Promise<Card[]> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('cards')
      .select('*')
      .eq('column_id', columnId)
      .order('position', { ascending: true });

    if (error) {
      this.logger.error(`Failed to fetch cards for column ${columnId}`, error);
      throw new Error(`Failed to fetch cards: ${error.message}`);
    }

    return data || [];
  }

  async getCardsByBoardId(boardId: string): Promise<Card[]> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('cards')
      .select(`
        *,
        columns!inner(board_id)
      `)
      .eq('columns.board_id', boardId)
      .order('position', { ascending: true });

    if (error) {
      this.logger.error(`Failed to fetch cards for board ${boardId}`, error);
      throw new Error(`Failed to fetch cards: ${error.message}`);
    }

    return data || [];
  }

  async getCardById(id: string): Promise<Card> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('cards')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error(`Failed to fetch card ${id}`, error);
      throw new NotFoundException(`Card with id ${id} not found`);
    }

    return data;
  }

  async updateCard(input: UpdateCardInput): Promise<Card> {
    const client = this.supabaseService.getClient();
    const now = new Date().toISOString();

    const updateData: Partial<Card> = {
      updated_at: now,
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    if (input.description !== undefined) {
      updateData.description = input.description;
    }

    if (input.color !== undefined) {
      updateData.color = input.color;
    }

    if (input.due_date !== undefined) {
      updateData.due_date = input.due_date;
    }

    const { data, error } = await client
      .from('cards')
      .update(updateData)
      .eq('id', input.id)
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to update card ${input.id}`, error);
      throw new Error(`Failed to update card: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Card with id ${input.id} not found`);
    }

    return data;
  }

  async moveCard(input: MoveCardInput): Promise<Card> {
    const client = this.supabaseService.getClient();

    // Get the card to move
    const card = await this.getCardById(input.id);
    const oldColumnId = card.column_id;
    const newColumnId = input.column_id;
    const oldPosition = card.position;
    const newPosition = input.newPosition;

    if (oldColumnId === newColumnId && oldPosition === newPosition) {
      return card;
    }

    // If moving to a different column
    if (oldColumnId !== newColumnId) {
      // Decrease positions of cards after the old position in the old column
      const { data: cardsToDecrease } = await client
        .from('cards')
        .select('id, position')
        .eq('column_id', oldColumnId)
        .gt('position', oldPosition);

      if (cardsToDecrease) {
        for (const cardToUpdate of cardsToDecrease) {
          await client
            .from('cards')
            .update({ position: cardToUpdate.position - 1 })
            .eq('id', cardToUpdate.id);
        }
      }

      // Increase positions of cards at and after the new position in the new column
      const { data: cardsToIncrease } = await client
        .from('cards')
        .select('id, position')
        .eq('column_id', newColumnId)
        .gte('position', newPosition);

      if (cardsToIncrease) {
        for (const cardToUpdate of cardsToIncrease) {
          await client
            .from('cards')
            .update({ position: cardToUpdate.position + 1 })
            .eq('id', cardToUpdate.id);
        }
      }
    } else {
      // Moving within the same column
              if (oldPosition < newPosition) {
          // Moving down: decrease positions of cards between old and new position
          const { data: cardsToDecrease } = await client
            .from('cards')
            .select('id, position')
            .eq('column_id', oldColumnId)
            .gt('position', oldPosition)
            .lte('position', newPosition);

          if (cardsToDecrease) {
            for (const cardToUpdate of cardsToDecrease) {
              await client
                .from('cards')
                .update({ position: cardToUpdate.position - 1 })
                .eq('id', cardToUpdate.id);
            }
          }
        } else {
          // Moving up: increase positions of cards between new and old position
          const { data: cardsToIncrease } = await client
            .from('cards')
            .select('id, position')
            .eq('column_id', oldColumnId)
            .gte('position', newPosition)
            .lt('position', oldPosition);

          if (cardsToIncrease) {
            for (const cardToUpdate of cardsToIncrease) {
              await client
                .from('cards')
                .update({ position: cardToUpdate.position + 1 })
                .eq('id', cardToUpdate.id);
            }
          }
        }
    }

    // Update the card's position and column
    const { data, error } = await client
      .from('cards')
      .update({ 
        column_id: newColumnId,
        position: newPosition,
        updated_at: new Date().toISOString()
      })
      .eq('id', input.id)
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to move card ${input.id}`, error);
      throw new Error(`Failed to move card: ${error.message}`);
    }

    return data;
  }

  async deleteCard(id: string): Promise<boolean> {
    const client = this.supabaseService.getClient();

    // Get the card to be deleted
    const card = await this.getCardById(id);

    // Delete the card
    const { error } = await client
      .from('cards')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error(`Failed to delete card ${id}`, error);
      throw new Error(`Failed to delete card: ${error.message}`);
    }

    // Update positions of remaining cards in the same column
    const { data: cardsToUpdate } = await client
      .from('cards')
      .select('id, position')
      .eq('column_id', card.column_id)
      .gt('position', card.position);

    if (cardsToUpdate) {
      for (const cardToUpdate of cardsToUpdate) {
        await client
          .from('cards')
          .update({ position: cardToUpdate.position - 1 })
          .eq('id', cardToUpdate.id);
      }
    }

    return true;
  }
} 
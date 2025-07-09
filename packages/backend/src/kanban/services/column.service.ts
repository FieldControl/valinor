import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Column, CreateColumnInput, UpdateColumnInput, MoveColumnInput } from '../types/column.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ColumnService {
  private readonly logger = new Logger(ColumnService.name);

  constructor(private supabaseService: SupabaseService) {}

  async createColumn(input: CreateColumnInput): Promise<Column> {
    const client = this.supabaseService.getClient();
    const id = uuidv4();
    const now = new Date().toISOString();

    // Get the next position if not provided
    let position = input.position;
    if (position === undefined) {
      const { data: existingColumns } = await client
        .from('columns')
        .select('position')
        .eq('board_id', input.board_id)
        .order('position', { ascending: false })
        .limit(1);

      position = existingColumns && existingColumns.length > 0 
        ? existingColumns[0].position + 1 
        : 0;
    }

    const columnData = {
      id,
      title: input.title,
      board_id: input.board_id,
      position,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await client
      .from('columns')
      .insert(columnData)
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to create column', error);
      throw new Error(`Failed to create column: ${error.message}`);
    }

    return data;
  }

  async getColumnsByBoardId(boardId: string): Promise<Column[]> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('columns')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true });

    if (error) {
      this.logger.error(`Failed to fetch columns for board ${boardId}`, error);
      throw new Error(`Failed to fetch columns: ${error.message}`);
    }

    return data || [];
  }

  async getColumnById(id: string): Promise<Column> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('columns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error(`Failed to fetch column ${id}`, error);
      throw new NotFoundException(`Column with id ${id} not found`);
    }

    return data;
  }

  async updateColumn(input: UpdateColumnInput): Promise<Column> {
    const client = this.supabaseService.getClient();
    const now = new Date().toISOString();

    const updateData: Partial<Column> = {
      updated_at: now,
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    if (input.position !== undefined) {
      updateData.position = input.position;
    }

    const { data, error } = await client
      .from('columns')
      .update(updateData)
      .eq('id', input.id)
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to update column ${input.id}`, error);
      throw new Error(`Failed to update column: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Column with id ${input.id} not found`);
    }

    return data;
  }

  async moveColumn(input: MoveColumnInput): Promise<Column> {
    const client = this.supabaseService.getClient();

    this.logger.log(`Moving column ${input.id} to position ${input.newPosition}`);

    // Get the column to move
    const column = await this.getColumnById(input.id);
    const oldPosition = column.position;
    const newPosition = input.newPosition;

    this.logger.log(`Column ${column.title}: oldPosition=${oldPosition}, newPosition=${newPosition}`);

    if (oldPosition === newPosition) {
      this.logger.log('Position unchanged, returning column as-is');
      return column;
    }

    // Get all columns for this board in current order
    const { data: allColumns } = await client
      .from('columns')
      .select('id, title, position')
      .eq('board_id', column.board_id)
      .order('position', { ascending: true });

    this.logger.log('Current columns state:', allColumns);

    if (!allColumns || allColumns.length === 0) {
      throw new Error('No columns found for this board');
    }

    // Create a new array with the correct order
    const reorderedColumns = [...allColumns];
    
    // Find the column to move
    const columnIndex = reorderedColumns.findIndex(col => col.id === input.id);
    if (columnIndex === -1) {
      throw new Error('Column not found in board');
    }

    // Remove the column from its current position
    const [movedColumn] = reorderedColumns.splice(columnIndex, 1);
    
    // Insert it at the new position
    reorderedColumns.splice(newPosition, 0, movedColumn);

    this.logger.log('New column order:', reorderedColumns.map(col => `${col.title}(${col.id})`));

    // Update all columns with their new positions
    for (let i = 0; i < reorderedColumns.length; i++) {
      const columnToUpdate = reorderedColumns[i];
      
      this.logger.log(`Updating column ${columnToUpdate.title} to position ${i}`);
      
      const { error } = await client
        .from('columns')
        .update({ 
          position: i,
          updated_at: new Date().toISOString()
        })
        .eq('id', columnToUpdate.id);

      if (error) {
        this.logger.error(`Failed to update column ${columnToUpdate.id} position`, error);
        throw new Error(`Failed to update column position: ${error.message}`);
      }
    }

    // Get the updated column data
    const { data: updatedColumn, error } = await client
      .from('columns')
      .select('*')
      .eq('id', input.id)
      .single();

    if (error) {
      this.logger.error(`Failed to fetch updated column ${input.id}`, error);
      throw new Error(`Failed to fetch updated column: ${error.message}`);
    }

    this.logger.log(`Column moved successfully. Final result:`, updatedColumn);

    // Get final state for verification
    const { data: finalColumns } = await client
      .from('columns')
      .select('id, title, position')
      .eq('board_id', column.board_id)
      .order('position', { ascending: true });

    this.logger.log('Final columns state after move:', finalColumns);

    return updatedColumn;
  }

  async deleteColumn(id: string): Promise<boolean> {
    const client = this.supabaseService.getClient();

    // Get the column to be deleted
    const column = await this.getColumnById(id);

    // Delete all cards in this column first
    await client.from('cards').delete().eq('column_id', id);

    // Delete the column
    const { error } = await client
      .from('columns')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error(`Failed to delete column ${id}`, error);
      throw new Error(`Failed to delete column: ${error.message}`);
    }

    // Update positions of remaining columns
    const { data: columnsToUpdate } = await client
      .from('columns')
      .select('id, position')
      .eq('board_id', column.board_id)
      .gt('position', column.position);

    if (columnsToUpdate) {
      for (const columnToUpdate of columnsToUpdate) {
        await client
          .from('columns')
          .update({ position: columnToUpdate.position - 1 })
          .eq('id', columnToUpdate.id);
      }
    }

    return true;
  }
} 
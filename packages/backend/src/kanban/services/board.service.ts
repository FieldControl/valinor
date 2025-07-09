import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Board, CreateBoardInput, UpdateBoardInput } from '../types/board.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(private supabaseService: SupabaseService) {}

  async createBoard(input: CreateBoardInput): Promise<Board> {
    const client = this.supabaseService.getClient();
    const id = uuidv4();
    const now = new Date().toISOString();

    const boardData = {
      id,
      title: input.title,
      description: input.description || null,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await client
      .from('boards')
      .insert(boardData)
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to create board', error);
      throw new Error(`Failed to create board: ${error.message}`);
    }

    return data;
  }

  async getAllBoards(): Promise<Board[]> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('boards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Failed to fetch boards', error);
      throw new Error(`Failed to fetch boards: ${error.message}`);
    }

    return data || [];
  }

  async getBoardById(id: string): Promise<Board> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('boards')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error(`Failed to fetch board ${id}`, error);
      throw new NotFoundException(`Board with id ${id} not found`);
    }

    return data;
  }

  async updateBoard(input: UpdateBoardInput): Promise<Board> {
    const client = this.supabaseService.getClient();
    const now = new Date().toISOString();

    const updateData: Partial<Board> = {
      updated_at: now,
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    if (input.description !== undefined) {
      updateData.description = input.description;
    }

    const { data, error } = await client
      .from('boards')
      .update(updateData)
      .eq('id', input.id)
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to update board ${input.id}`, error);
      throw new Error(`Failed to update board: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Board with id ${input.id} not found`);
    }

    return data;
  }

  async deleteBoard(id: string): Promise<boolean> {
    const client = this.supabaseService.getClient();

    // First delete all related columns and cards (cascading delete)
    await client.from('cards').delete().eq('column_id', id);
    await client.from('columns').delete().eq('board_id', id);

    const { error } = await client
      .from('boards')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error(`Failed to delete board ${id}`, error);
      throw new Error(`Failed to delete board: ${error.message}`);
    }

    return true;
  }
} 
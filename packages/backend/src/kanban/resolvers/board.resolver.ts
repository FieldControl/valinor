import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { BoardService } from '../services/board.service';
import { ColumnService } from '../services/column.service';
import { BoardDto, CreateBoardInputDto, UpdateBoardInputDto } from '../dto/board.dto';
import { ColumnDto } from '../dto/column.dto';

@Resolver(() => BoardDto)
export class BoardResolver {
  constructor(
    private readonly boardService: BoardService,
    private readonly columnService: ColumnService,
  ) {}

  @Query(() => [BoardDto], { name: 'boards' })
  async getAllBoards(): Promise<BoardDto[]> {
    return this.boardService.getAllBoards();
  }

  @Query(() => BoardDto, { name: 'board' })
  async getBoardById(@Args('id', { type: () => ID }) id: string): Promise<BoardDto> {
    return this.boardService.getBoardById(id);
  }

  @Mutation(() => BoardDto, { name: 'createBoard' })
  async createBoard(@Args('input') input: CreateBoardInputDto): Promise<BoardDto> {
    return this.boardService.createBoard(input);
  }

  @Mutation(() => BoardDto, { name: 'updateBoard' })
  async updateBoard(@Args('input') input: UpdateBoardInputDto): Promise<BoardDto> {
    return this.boardService.updateBoard(input);
  }

  @Mutation(() => Boolean, { name: 'deleteBoard' })
  async deleteBoard(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.boardService.deleteBoard(id);
  }

  @ResolveField(() => [ColumnDto], { name: 'columns' })
  async getColumns(@Parent() board: BoardDto): Promise<ColumnDto[]> {
    return this.columnService.getColumnsByBoardId(board.id);
  }
} 
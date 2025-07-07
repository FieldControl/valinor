
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Board } from './board.entity';
import { BoardService } from './board.service';

@Resolver(() => Board)
export class BoardResolver {
  constructor(private readonly boardService: BoardService) {}

  @Query(() => [Board], { name: 'boards' })
  async getBoards() {
    return this.boardService.findAllBoards();
  }

  @Query(() => Board, { name: 'board' })
  async getBoardById(@Args('id', { type: () => Int }) id: number) {
    return this.boardService.findBoardById(id);
  }

  @Mutation(() => Board)
  async createBoard(@Args('name') name: string) {
    return this.boardService.createBoard(name);
  }

  @Mutation(() => Board)
  async updateBoard(
    @Args('id', { type: () => Int }) id: number,
    @Args('name') name: string,
  ) {
    const board = await this.boardService.findBoardById(id);
    if (!board) {
      throw new Error(`Board with id ${id} not found`);
    }
    return this.boardService.updateBoard(id, name);
  }

  @Mutation(() => Boolean)
  async deleteBoard(@Args('id', { type: () => Int }) id: number) {
    const board = await this.boardService.findBoardById(id);
    if (!board) {
      throw new Error(`Board with id ${id} not found`);
    }
    return this.boardService.deleteBoard(id);
  }
}

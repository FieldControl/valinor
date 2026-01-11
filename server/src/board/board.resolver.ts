import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BoardService } from './board.service.js';
import { Board } from './entities/board.entity.js';
import { CreateBoardInput } from './dto/create-board.input.js';
import { UpdateBoardInput } from './dto/update-board.input.js';

@Resolver(() => Board)
export class BoardResolver {
  constructor(private readonly boardService: BoardService) {}

  @Mutation(() => Board)
  createBoard(@Args('createBoardInput') createBoardInput: CreateBoardInput) {
    return this.boardService.create(createBoardInput);
  }

  @Query(() => [Board], { name: 'boards' })
  findAll() {
    return this.boardService.findAll();
  }

  @Query(() => Board, { name: 'board' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.boardService.findOne(id);
  }

  @Mutation(() => Board)
  updateBoard(@Args('updateBoardInput') updateBoardInput: UpdateBoardInput) {
    return this.boardService.update(updateBoardInput.id, updateBoardInput);
  }

  @Mutation(() => Board)
  removeBoard(@Args('id', { type: () => Int }) id: number) {
    return this.boardService.remove(id);
  }
}

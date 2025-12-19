import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BoardService } from './board.service';
import { Board } from './entities/board.entity';
import { BoardUser } from './entities/board-user.entity';
import { CreateBoardInput } from './dto/create-board.input';
import { AddUserToBoardInput } from './dto/add-user-to-board.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Resolver(() => Board)
@UseGuards(GqlAuthGuard)
export class BoardResolver {
  constructor(private readonly boardService: BoardService) {}

  @Mutation(() => Board)
  @UseGuards(GqlAuthGuard)
  createBoard(@Args('createBoardInput') createBoardInput: CreateBoardInput, @CurrentUser() user: any) {
    return this.boardService.create(createBoardInput, user.sr_id);
  }

  @Query(() => [Board], { name: 'myBoards' })
  @UseGuards(GqlAuthGuard)
  findMyBoards(@CurrentUser() user: any) {
    return this.boardService.findBoardsByUser(user.sr_id);
  }

  @Query(() => Board, { name: 'getBoard' })
  findBoardWithColumns(@Args('boardId', { type: () => Int }) boardId: number) {
    return this.boardService.findBoardWithColumns(boardId);
  }

  @Query(() => [BoardUser], { name: 'getBoardUsers' })
  getBoardUsers(@Args('boardId', { type: () => Int }) boardId: number) {
    return this.boardService.getBoardUsers(boardId);
  }

  @Mutation(() => BoardUser)
  addUserToBoard(
    @Args('addUserToBoardInput') addUserToBoardInput: AddUserToBoardInput,
    @CurrentUser() user: any
  ) {
    return this.boardService.addUserToBoard(
      addUserToBoardInput.boardId,
      addUserToBoardInput.email,
      user.sr_id
    );
  }

}
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateSwimlaneDto } from './dto/create-swimlane.dto';
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Swimlane } from './entities/swimlane.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SwimlaneService {
  constructor(
    @InjectRepository(Swimlane)
    private swimlaneRepository: Repository<Swimlane>,
    private userService: UserService,
  ) { }

  async create(createSwimlaneDto: CreateSwimlaneDto, userId: number) {
    const swimlane = new Swimlane();
    swimlane.name = createSwimlaneDto.name;
    swimlane.order = createSwimlaneDto.order;
    swimlane.boardId = createSwimlaneDto.boardId;

    const isConnected = await this.userService.isConnectedToBoard(
      userId,
      swimlane.boardId,
    )

    if (!isConnected) {
      throw new UnauthorizedException('You are not a part of this board.');
    }

    return this.swimlaneRepository.save(swimlane);
  }

  async hasAccessToSwimlane(swimlaneId: number, userId: number) {
    const hasAccess = await this.swimlaneRepository.count({
      where: {
        id: swimlaneId,
        board: { users: { id: userId } },
      },
    });

    return hasAccess > 0;
  }

  findAllByBoardId(boardId: number, userId: number) {
    return this.swimlaneRepository.find({
      where: {
        boardId,
        board: {
          users: {
            id: userId
          }
        },
      },
    });
  }

  update(id: number, userId: number, updateSwimlaneDto: UpdateSwimlaneDto) {
    return this.swimlaneRepository.update({
      id,
      board: {
        users: { id: userId },
      },
    },
      {
        name: updateSwimlaneDto.name,
        order: updateSwimlaneDto.order,
      });
  }

  remove(id: number, userId: number) {
    return this.swimlaneRepository.delete({
      id,
      board: { users: { id: userId } },
    });
  }
}

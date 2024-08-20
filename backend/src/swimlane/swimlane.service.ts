import { Injectable } from '@nestjs/common';
import { CreateSwimlaneDto } from './dto/create-swimlane.dto';
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Swimlane } from './entities/swimlane.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { ReordereSwimlaneDto } from './dto/reorder-swimlane.dto';

@Injectable()
export class SwimlaneService {
  //Constructor creation
  constructor(
    @InjectRepository(Swimlane)
    private swimlaneRepository: Repository<Swimlane>,
    private userService: UserService,
  ) {}

  //Swimlane creation
  async create(createSwimlaneDto: CreateSwimlaneDto, userId: number) {
    const swimlane = new Swimlane();
    swimlane.name = createSwimlaneDto.name;
    swimlane.order = createSwimlaneDto.order;
    swimlane.boardId = createSwimlaneDto.boardId;

    await this.userService.isConnectedToBoard(userId, swimlane.boardId);
    return this.swimlaneRepository.save(swimlane);
  }

  //Update swimlane orders
  async updateSwimlaneOrders(reorder: ReordereSwimlaneDto, userId: number) {
    await this.userService.isConnectedToBoard(userId, reorder.boardId);

    const promises = reorder.items.map((swimlane) =>
      this.swimlaneRepository.update(swimlane.id, { order: swimlane.order }),
    );

    await Promise.all(promises);

    return true;
  }

  //Check if user has access to swimlane
  async hasAccessToSwimlane(swimlaneId: number, userId: number) {
    const hasAccess = await this.swimlaneRepository.count({
      where: {
        id: swimlaneId,
        board: { users: { id: userId } },
      },
    });

    return hasAccess > 0;
  }

  //Get all swimlanes from the board
  findAllByBoardId(boardId: number, userId: number) {
    return this.swimlaneRepository.find({
      where: {
        boardId,
        board: { users: { id: userId } },
      },
    });
  }

  //Update swimlane
  async update(
    id: number,
    userId: number,
    updateSwimlaneDto: UpdateSwimlaneDto,
  ) {
    await this.userService.isConnectedToBoard(
      userId,
      updateSwimlaneDto.boardId,
    );
    return this.swimlaneRepository.update(id, {
      name: updateSwimlaneDto.name,
    });
  }

  //Remove swimlane
  async remove(id: number, userId: number) {
    await this.userService.isConnectedToSwimlane(userId, id);
    return this.swimlaneRepository.delete(id);
  }
}

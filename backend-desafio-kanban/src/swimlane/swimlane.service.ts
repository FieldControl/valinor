import { Injectable } from '@nestjs/common';
import { CreateSwimlaneDto } from './dto/create-swimlane.dto';
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Swimlane } from './entities/swimlane.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { ReordereSwimlaneDto } from './dto/reorder-swimlane.dto';
import { console } from 'inspector';

@Injectable()
export class SwimlaneService {
  constructor(
    @InjectRepository(Swimlane)
    private swimlaneRepository: Repository<Swimlane>,
    private userService: UserService,
  ) {}

  async create(createSwimlaneDto: CreateSwimlaneDto, idUser: number) {
    const swimlane = new Swimlane();
    swimlane.nameSwimlane = createSwimlaneDto.name;
    swimlane.order = createSwimlaneDto.order;
    swimlane.boardId = createSwimlaneDto.boardId;
    console.log(createSwimlaneDto, idUser);
    await this.userService.isConnectedToBoard(idUser, swimlane.boardId);
    return this.swimlaneRepository.save(swimlane);
  }

  async updateSwimlaneOrders(reorder: ReordereSwimlaneDto, idUser: number) {
    await this.userService.isConnectedToBoard(idUser, reorder.boardCod);

    const promises = reorder.id.map((swimlane) =>
      this.swimlaneRepository.update(swimlane.id, {
        order: swimlane.order,
      }),
    );

    await Promise.all(promises);

    return true;
  }

  async hasAccessToSwimlane(swimlaneCod: number, userId: number) {
    const hasAccess = await this.swimlaneRepository.count({
      where: {
        idSwimlane: swimlaneCod,
        board: { users: { idUser: userId } },
      },
    });

    return hasAccess > 0;
  }

  findAllByBoardId(boardId: number, userId: number) {
    return this.swimlaneRepository.find({
      where: {
        boardId,
        board: { users: { idUser: userId } },
      },
    });
  }

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
      nameSwimlane: updateSwimlaneDto.name,
    });
  }
  // JWT Guard para bloquear se o usuário não fizer parte do quadro.
  async remove(idSwimlane: number, userId: number) {
    await this.userService.isConnectedToSwimlane(userId, idSwimlane);
    return this.swimlaneRepository.delete(idSwimlane);
  }
}

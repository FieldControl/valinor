import { Injectable } from '@nestjs/common';
import { CreateSwimlaneDto } from './dto/create-swimlane.dto';
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Swimlane } from './entities/swimlane.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SwimlaneService {
  constructor(
    @InjectRepository(Swimlane)
    private swimlaneRepository: Repository<Swimlane>,
  ) { }

  create(createSwimlaneDto: CreateSwimlaneDto) {
    const swimlane = new Swimlane();
    swimlane.name = createSwimlaneDto.name;
    swimlane.order = createSwimlaneDto.order;
    swimlane.boardId = createSwimlaneDto.boardId;
    return this.swimlaneRepository.save(swimlane);
  }

  findAllByBoardId(boardId: number) {
    return this.swimlaneRepository.find({
      where: {
        boardId,
      }
    });
  }

  update(id: number, updateSwimlaneDto: UpdateSwimlaneDto) {
    return this.swimlaneRepository.update(id, {
      name: updateSwimlaneDto.name,
      order: updateSwimlaneDto.order,
    });
  }

  remove(id: number) {
    // TODO: Prevent deletion if user is not a member of the board with JWT
    return this.swimlaneRepository.delete(id);
  }
}

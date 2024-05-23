import { Injectable } from '@nestjs/common';
import { CreateSwimlaneDto } from './dto/create-swimlane.dto';
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto';

@Injectable()
export class SwimlaneService {
  create(createSwimlaneDto: CreateSwimlaneDto) {
    return 'This action adds a new swimlane';
  }

  findAll() {
    return `This action returns all swimlane`;
  }

  findOne(id: number) {
    return `This action returns a #${id} swimlane`;
  }

  update(id: number, updateSwimlaneDto: UpdateSwimlaneDto) {
    return `This action updates a #${id} swimlane`;
  }

  remove(id: number) {
    return `This action removes a #${id} swimlane`;
  }
}

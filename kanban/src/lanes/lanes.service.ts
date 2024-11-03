import { Inject, Injectable } from '@nestjs/common';
import { CreateLaneDto } from './dto/create-lane.dto';
import { UpdateLaneDto } from './dto/update-lane.dto';
import { Repository } from 'typeorm';
import { Lane } from './entities/lane.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LanesService {
  async findAllByBoard(id: number) {
    const lanes = await this.laneRepository.find({ where: { boardId: id, status: 1 }, relations: ['tasks'] });
    return lanes.map(lane => ({
      ...lane,  
      tasks: lane.tasks.filter(task => task.status !== 0),
    }));
  }
  constructor(@InjectRepository(Lane) private laneRepository: Repository<Lane>){}
  async create(createLaneDto: CreateLaneDto) {
    return await this.laneRepository.insert(createLaneDto);
  }

  async findAll() {
    return await this.laneRepository.find({where: {status:1},loadRelationIds: true});
  }

  async findOne(id: number) {
    return await this.laneRepository.findOne({where:{id:id,status:1}, loadRelationIds: true});
  }

  async update(id: number, updateLaneDto: UpdateLaneDto) {
    return await this.laneRepository.update({id:id},updateLaneDto);
  }

  async remove(id: number) {
    return await this.laneRepository.update({id:id},{status: 0});

  }
}

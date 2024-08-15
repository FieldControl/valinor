import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Swimlane } from './entities/swimlane.entity';
import { CreateSwimlaneDto } from './dto/create-swimlane.dto';
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto';

@Injectable()
export class SwimlaneService {
  constructor(
    @InjectRepository(Swimlane)
    private readonly swimlaneRepository: Repository<Swimlane>,
  ) {}

  async create(createSwimlaneDto: CreateSwimlaneDto): Promise<Swimlane> {
    const swimlane = this.swimlaneRepository.create(createSwimlaneDto);
    return this.swimlaneRepository.save(swimlane);
  }

  async findAll(): Promise<Swimlane[]> {
    return this.swimlaneRepository.find();
  }

  async findOne(id: number): Promise<Swimlane> {
    return this.swimlaneRepository.findOneBy({ id });
  }

  async update(id: number, updateSwimlaneDto: UpdateSwimlaneDto): Promise<Swimlane> {
    await this.swimlaneRepository.update(id, updateSwimlaneDto);
    return this.swimlaneRepository.findOneBy({ id });
  }
  
  async remove(id: number): Promise<void> {
    await this.swimlaneRepository.delete(id);
  }
}

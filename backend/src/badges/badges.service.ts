import { Injectable } from '@nestjs/common';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Badge } from './entities/badge.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(Badge)
    private readonly badgeRepository: Repository<Badge>
  ){}

  async create(createBadgeDto: CreateBadgeDto) {
    return await this.badgeRepository.save(createBadgeDto);
  }

  async findAll() {
    const badges = await this.badgeRepository.find({order:{createdAt:"ASC"}})
    return badges;
  }

  async findOne(id: string) {
    const badge = await this.badgeRepository.findOneBy({id:id})
    return badge;
  }

  async update(id: string, updateBadgeDto: Partial<Badge>) {
    return await this.badgeRepository.update(id,updateBadgeDto);
  }

  async remove(id: string) {
    return await this.badgeRepository.delete(id);
  }
}

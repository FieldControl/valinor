import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KanbanEntity } from 'src/Entity/kanban.entity';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class KanbanService {
    constructor(@InjectRepository(KanbanEntity) private repo: Repository<KanbanEntity>) {
    }
    async getAllKanbans() {
        return await this.repo.find();
    }
}

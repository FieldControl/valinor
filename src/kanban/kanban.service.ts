import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateKanbanDto } from 'src/DTO/create-kanban-dto';
import { KanbanEntity, KanbanStatus } from 'src/Entity/kanban.entity';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class KanbanService {
    constructor(@InjectRepository(KanbanEntity) private repo: Repository<KanbanEntity>) {
    }
    async getAllKanbans() {
        return await this.repo.find();
    }

    async createKanban(createKanbanDTO: CreateKanbanDto){
        const kanban = new KanbanEntity();
        kanban.title = createKanbanDTO.title;
        kanban.description = createKanbanDTO.description;
        kanban.status = KanbanStatus.OPEN;
    
        this.repo.create(kanban);
        try {
            return await this.repo.save(kanban);            
        } catch (error) {
            throw new InternalServerErrorException("Ocorreu um erro ao criar o kanban");
        }
      }

      async update(id: number, status: KanbanStatus) {
        try {
          await this.repo.update({id}, {status});
          return this.repo.findOneBy({id});
        } catch (err) {
          throw new InternalServerErrorException('Ocorreu um erro ao alterar o status');
        }
    
      }
    
      async delete(id: number) {
        try {
          return await this.repo.delete({id});
        } catch (err) {
          throw new InternalServerErrorException('Ocorreu um erro ao deletar o kanban');
        }
    
    
      }
}

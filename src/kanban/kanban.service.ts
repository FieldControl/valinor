import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateKanbanDto } from 'src/DTO/create-kanban-dto';
import { KanbanEntity, KanbanStatus } from 'src/Entity/kanban.entity';
import { UserEntity } from 'src/Entity/user.entity';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class KanbanService {
    constructor(@InjectRepository(KanbanEntity) private repo: Repository<KanbanEntity>) {
    }


    async getAllKanbans(user: UserEntity) {
        const query = await this.repo.createQueryBuilder('kanban');
    
        query.where(`kanban.userId = :userId`, {userId: user.id});
    
        try {
          return await query.getMany();
        } catch (err) {
          throw new NotFoundException('Nao foi encontrando nenhum kanban nesse usuario');
        }
    
    
      }
    async createKanban(createKanbanDTO: CreateKanbanDto, user: UserEntity){
        const kanban = new KanbanEntity();
        kanban.title = createKanbanDTO.title;
        kanban.description = createKanbanDTO.description;
        kanban.status = KanbanStatus.OPEN;
        kanban.userId = user.id
    
        this.repo.create(kanban);
        try {
            return await this.repo.save(kanban);            
        } catch (error) {
            throw new InternalServerErrorException("Ocorreu um erro ao criar o kanban");
        }
      }

      async update(id: number, status: KanbanStatus, user: UserEntity) {
        try {
          await this.repo.update({id, userId: user.id}, {status});
          return this.repo.findOneBy({id});
        } catch (err) {
          throw new InternalServerErrorException('Ocorreu um erro ao alterar o status');
        }
    
      }
    
      async delete(id: number, user: UserEntity) {
        const result = await this.repo.delete({id, userId: user.id});

        if (result.affected === 0) {
          throw new NotFoundException('Ocorreu um erro ao deletar o kanban');
        } else {
          return { success: true}
        } 
      }
}

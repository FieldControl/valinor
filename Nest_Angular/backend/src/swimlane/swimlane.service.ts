import { Injectable } from '@nestjs/common';
import { CreateSwimlaneDto } from './dto/create-swimlane.dto';
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Swimlane } from './entities/swimlane.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { ReorderedSwimlaneDto } from './dto/reorder-swimlane.dto';
// import { ReordereSwimlaneDto } from './dto/reorder-swimlane.dto';

@Injectable()
export class SwimlaneService {
  constructor(
    @InjectRepository(Swimlane)
    private swimlaneRepository: Repository<Swimlane>,
    private userService: UserService,
  ) {}

  // Cria uma nova swimlane
  // Verifica se o usuário tem acesso ao board onde a swimlane será criada
  async create(createSwimlaneDto: CreateSwimlaneDto, userId: number) {
    const swimlane = new Swimlane();
    swimlane.nome = createSwimlaneDto.nome;
    swimlane.ordem = createSwimlaneDto.ordem;
    swimlane.boardId = createSwimlaneDto.boardId;

    await this.userService.isConnectedToBoard(userId, swimlane.boardId);
    return this.swimlaneRepository.save(swimlane);
  }
  
  // Atualiza a ordem das swimlanes
  // Verifica se o usuário tem acesso ao board onde a swimlane será movida
  async updateSwimlaneOrders(
    reorder: ReorderedSwimlaneDto, 
    userId: number
  ) {
    await this.userService.isConnectedToBoard(userId, reorder.boardId);

    const promises = reorder.items.map((swimlane) =>
    this.swimlaneRepository.update(swimlane.id, {ordem : swimlane.ordem})
  )

  await Promise.all(promises);

    return true;
  }

  // Verifica se o usuário tem acesso à swimlane
  async hasAccessToSwimlane(swimlaneId: number, userId: number) {
    const hasAccess = await this.swimlaneRepository.count({
      where: {
        id: swimlaneId,
        board: { users: { id: userId } },
      },
    });

    return hasAccess > 0;
  }

  // Retorna todas as swimlanes associadas ao board
  findAllByBoardId(boardId: number, userId: number) {
    return this.swimlaneRepository.find({
      where: {
        boardId,
        board: { users: { id: userId } },
      },
    });
  }
// Retorna uma swimlane específica associada ao board
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
      nome: updateSwimlaneDto.nome,
    });
  }

  // Remove uma swimlane
  async remove(id: number, userId: number) {
    await this.userService.isConnectedToSwimlane(userId, id);
    return this.swimlaneRepository.delete(id);
  }


}

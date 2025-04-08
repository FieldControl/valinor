import { Injectable, UnauthorizedException } from '@nestjs/common'; // Importa os decorators e classes do NestJS
import { CreateCardDto } from './dto/create-card.dto'; // Importa o DTO para criação de cartão
import { UpdateCardDto } from './dto/update-card.dto'; // Importa o DTO para atualização de cartão
import { InjectRepository } from '@nestjs/typeorm'; // Importa o decorator para injeção de repositório
import { Card } from './entities/card.entity'; // Importa a entidade de cartão
import { Repository } from 'typeorm'; // Importa o repositório do TypeORM
import { SwimlaneService } from 'src/swimlane/swimlane.service'; // Importa o serviço de swimlane
import { UserService } from 'src/user/user.service'; // Importa o serviço de usuário
import { ReorderedCardDto } from './dto/reorder-cards.dto'; // Importa o DTO para reordenação de cartões

@Injectable() // Define a classe como um serviço injetável
export class CardService { // Define a classe CardService
  constructor( // Construtor da classe CardService
    @InjectRepository(Card) // Injeta o repositório de cartões
    private cardRepository: Repository<Card>, // Repositório de cartões
    private swimlaneService: SwimlaneService, // Serviço de swimlane
    private userService: UserService, // Serviço de usuário
  ) {}

  async create(createCardDto: CreateCardDto, userId: number) { // Método para criar um cartão
    const card = new Card(); // Cria uma nova instância de cartão
    card.name = createCardDto.name; // Define o nome do cartão
    card.content = createCardDto.content; // Define o conteúdo do cartão
    card.swimlaneId = createCardDto.swimlaneId; // Define o ID do swimlane
    card.order = createCardDto.order; // Define a ordem do cartão
    const hasAccessToSwimlane = await this.swimlaneService.hasAccessToSwimlane( // Verifica se o usuário tem acesso ao swimlane
      createCardDto.swimlaneId, // ID do swimlane
      userId, // ID do usuário
    );
    if (!hasAccessToSwimlane) { // Se o usuário não tem acesso ao swimlane
      throw new UnauthorizedException('You are not a part of this board.'); // Lança uma exceção de não autorizado
    }
    return this.cardRepository.save(card); // Salva o cartão no banco de dados
  }

  async updateCardOrdersAndSwimlanes( // Método para atualizar a ordem e os swimlanes dos cartões
    reorder: ReorderedCardDto, // DTO de reordenação de cartões
    userId: number, // ID do usuário
  ) {
    await this.userService.isConnectedToBoard(userId, reorder.boardId); // Verifica se o usuário está conectado ao board

    const promises = reorder.cards.map((card) => // Mapeia os cartões para promessas, as promessas são objetos que representam a eventual conclusão (ou falha) de uma operação assíncrona e seu valor resultante.
      this.cardRepository.update(card.id, { // Atualiza o cartão no banco de dados
        order: card.order, // Atualiza a ordem do cartão
        swimlaneId: card.swimlaneId, // Atualiza o ID do swimlane
      }),
    );

    await Promise.all(promises); // Aguarda a conclusão de todas as promessas

    return true; // Retorna verdadeiro se a operação for bem-sucedida
  }

  async update(id: number, userId: number, updateCardDto: UpdateCardDto) { // Método para atualizar um cartão
    if (!updateCardDto.swimlaneId) { // Se o ID do swimlane não for fornecido, dispara o erro ""swimlaneId is required"
      throw new Error("swimlaneId is required");
    }
    await this.userService.isConnectedToSwimlane( // Verifica se o usuário está conectado ao swimlane
      userId, // ID do usuário
      updateCardDto.swimlaneId, // ID do swimlane
    );
    return this.cardRepository.update(id, { // Atualiza o cartão no banco de dados
      name: updateCardDto.name, // Atualiza o nome do cartão
      content: updateCardDto.content, // Atualiza o conteúdo do cartão
    });
  }

  async remove(id: number, userId: number) { // Método para remover um cartão
    const card = await this.cardRepository.findOneBy({ id }); // Busca o cartão pelo ID
    await this.userService.isConnectedToSwimlane(userId, card!.swimlaneId); // Verifica se o usuário está conectado ao swimlane
    return this.cardRepository.delete(id); // Remove o cartão do banco de dados
  }
}

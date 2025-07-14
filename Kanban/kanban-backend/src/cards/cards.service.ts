import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
  ) {}

  /**
   * Cria um novo card para um utilizador específico.
   * @param createCardDto - Os dados para o novo card.
   * @param userId - A ID do utilizador autenticado.
   * @returns A promessa do card recém-criado.
   */
  async create(createCardDto: CreateCardDto, userId: number): Promise<Card> {
    const newCard = this.cardRepository.create({
      ...createCardDto,
      userId: userId, // Garante que o novo card tem um dono.
    });
    return this.cardRepository.save(newCard);
  }

  /**
   * Busca todos os cards que pertencem a um utilizador específico.
   * @param userId - A ID do utilizador autenticado.
   * @param columnId - (Opcional) A ID da coluna para filtrar.
   * @returns Uma promessa de um array com os cards do utilizador.
   */
  findAll(userId: number, columnId?: number): Promise<Card[]> {
    // A cláusula 'where' agora tem duas condições:
    // 1. A userId do card deve ser a do utilizador logado.
    // 2. Se um columnId for fornecido, ele também é usado para filtrar.
    const whereClause: any = { userId };
    if (columnId) {
      whereClause.columnId = columnId;
    }
    return this.cardRepository.find({ where: whereClause });
  }

   /**
   * Atualiza os dados de um card no banco de dados.
   * @param id - A ID do card a ser atualizado.
   * @param updateCardDto - Os novos dados para o card.
   * @param userId - A ID do utilizador que está a fazer a requisição.
   */
  async update(id: number, updateCardDto: UpdateCardDto, userId: number): Promise<Card> {
    // 1. Encontra o card existente no banco de dados.
    const card = await this.cardRepository.findOne({ where: { id } });

    if (!card) {
      throw new NotFoundException(`Card com ID #${id} não encontrado.`);
    }

    // 2. Verifica se o utilizador tem permissão para editar este card.
    if (card.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para editar este card.');
    }

    
    //    Usamos 'Object.assign' para mesclar os dados de atualização no card que já encontrámos.
    //    Isto é mais direto do que usar 'preload' neste caso e evita o erro de tipo.
    Object.assign(card, updateCardDto);

    // 4. Salva o card atualizado de volta no banco de dados.
    //    Agora, o 'card' tem a garantia de ser um objeto 'Card' e não 'undefined'.
    return this.cardRepository.save(card);
  }

  /**
   * Remove um card, garantindo a permissão do utilizador.
   * @param id - A ID do card a ser removido.
   * @param userId - A ID do utilizador que está a fazer a requisição.
   */
  async remove(id: number, userId: number): Promise<{ message: string }> {
    // 1. Encontra o card.
    const card = await this.cardRepository.findOne({ where: { id } });

    if (!card) {
      throw new NotFoundException(`Card com ID #${id} não encontrado.`);
    }

    // 2. Verificação de Segurança.
    if (card.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para apagar este card.');
    }

    // 3. Apaga o card.
    await this.cardRepository.delete(id);
    return { message: `Card com ID #${id} removido com sucesso.` };
  }
}
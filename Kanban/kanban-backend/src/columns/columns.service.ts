// ARQUIVO: src/columns/columns.service.ts

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateColumnDto } from './dto/create-column.dto';
import { Column } from './entities/column.entity';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(Column)
    private readonly columnRepository: Repository<Column>,
  ) {}

  /**
   * Cria uma nova coluna para um utilizador específico.
   * @param createColumnDto - Os dados para a nova coluna.
   * @param userId - A ID do utilizador autenticado que é o dono da coluna.
   * @returns A promessa da coluna recém-criada.
   */
  async create(createColumnDto: CreateColumnDto, userId: number): Promise<Column> {
    // Criamos uma nova instância da entidade, combinando os dados do DTO
    // com a ID do utilizador que veio do token.
    const newColumn = this.columnRepository.create({
      ...createColumnDto,
      userId: userId, //  Garante que a nova coluna tem um dono.
    });
    return this.columnRepository.save(newColumn);
  }

  /**
   * Busca todas as colunas que pertencem a um utilizador específico.
   * @param userId - A ID do utilizador autenticado.
   * @returns Uma promessa de um array com as colunas do utilizador.
   */
  findAll(userId: number): Promise<Column[]> {
    // A cláusula 'where' agora filtra para encontrar apenas as colunas
    // onde a 'userId' corresponde à ID do utilizador logado.
    return this.columnRepository.find({
      where: { userId }, //  Garante que o utilizador só veja as suas próprias colunas.
    });
  }

  /**
   * Remove uma coluna, garantindo que o utilizador só pode remover as suas próprias colunas.
   * @param id - A ID da coluna a ser removida.
   * @param userId - A ID do utilizador que está a fazer a requisição.
   */
  async remove(id: number, userId: number): Promise<{ message: string }> {
    // 1. Primeiro, encontramos a coluna que se quer apagar.
    const column = await this.columnRepository.findOne({ where: { id } });

    if (!column) {
      throw new NotFoundException(`Coluna com ID #${id} não encontrada.`);
    }

    // 2.  Verificação de Segurança Crucial:
    //    Verificamos se a 'userId' da coluna guardada no banco de dados é a mesma
    //    da 'userId' do utilizador que está a tentar apagá-la.
    if (column.userId !== userId) {
      // Se não for, lançamos um erro 403 Forbidden, pois ele está a tentar
      // apagar algo que não lhe pertence.
      throw new ForbiddenException('Você não tem permissão para apagar esta coluna.');
    }

    // 3. Se a verificação passar, apagamos a coluna.
    await this.columnRepository.delete(id);
    return { message: `Coluna com ID #${id} removida com sucesso.` };
  }

  // NOTA: O update e o findOne também precisariam de ser atualizados com esta
  // mesma lógica de segurança se fossemos usá-los extensivamente.
}
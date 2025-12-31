import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Column } from "./entities/coluna.entity";

/**
 * Serviço para gerenciar colunas do kanban.
 */
@Injectable()
export class ColumnService {
  constructor(
    @InjectRepository(Column)
    private columnRepo: Repository<Column>,
  ) {}

  /** Retorna todas as colunas com seus cards (ordenadas) */
  findAll() {
    return this.columnRepo.find({
      relations: ["cards"],
      order: {
        id: "ASC",
        cards: {
          id: "ASC",
        },
      } as any,
    });
  }

  /** Cria uma nova coluna */
  create(titulo: string) {
    const newCol = this.columnRepo.create({ titulo });
    return this.columnRepo.save(newCol);
  }

  /** Remove coluna pelo id */
  remove(id: number) {
    return this.columnRepo.delete(id);
  }
}

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Column } from "./entities/coluna.entity";

@Injectable()
export class ColumnService {
  constructor(
    @InjectRepository(Column)
    private columnRepo: Repository<Column>,
  ) {}

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

  create(titulo: string) {
    const newCol = this.columnRepo.create({ titulo });
    return this.columnRepo.save(newCol);
  }

  remove(id: number) {
    return this.columnRepo.delete(id);
  }
}

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Card } from "./entities/card.entity";

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepo: Repository<Card>,
  ) {}

  create(titulo: string, conteudo: string, colunaID: number) {
    if (!titulo) {
      throw new Error("Titulo vazio!");
    }
    const newCard = this.cardRepo.create({
      titulo: titulo,
      conteudo: conteudo,
      coluna: { id: colunaID },
    });

    return this.cardRepo.save(newCard);
  }
  async update(id: number, data: { colunaID?: number; titulo?: string; conteudo?: string }) {
    return this.cardRepo.update(id, data);
  }

  remove(id: number) {
    return this.cardRepo.delete(id);
  }
}

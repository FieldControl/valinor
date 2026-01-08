import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Card } from "./entities/card.entity";

/**
 * Serviço para gerenciar operações de Card (CRUD).
 * Comentários simples: considerar uso de exceções do Nest (ex: BadRequestException)
 */
@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepo: Repository<Card>,
  ) {}

  /**
   * Cria um novo card e salva no repositório.
   * Validação simples: lança erro se o título estiver vazio.
   * TODO: usar BadRequestException em vez de Error para respostas HTTP corretas.
   */
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

  /**
   * Atualiza campos do card indicado por id.
   */
  async update(id: number, data: { colunaID?: number; titulo?: string; conteudo?: string }) {
    return this.cardRepo.update(id, data);
  }

  /**
   * Remove card pelo id.
   */
  remove(id: number) {
    return this.cardRepo.delete(id);
  }
}

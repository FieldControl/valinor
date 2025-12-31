import { Controller, Post, Body, Patch, Param, Delete, ParseIntPipe } from "@nestjs/common";
import { CardService } from "./cards.service";

/**
 * Controller para operações de Cards.
 * Comentários simples: usar DTOs e validação no futuro (ex: class-validator).
 */
@Controller("cards")
export class CardController {
  constructor(private readonly cardsService: CardService) {}

  /**
   * Cria um card.
   * body: { titulo, conteudo, colunaID }
   * TODO: substituir o tipo inline por um CreateCardDto e adicionar validação.
   */
  @Post()
  create(@Body() body: { titulo: string; conteudo: string; colunaID: number }) {
    console.log(body); // log para debug
    // Passamos title e content
    return this.cardsService.create(body.titulo, body.conteudo, body.colunaID);
  }

  /**
   * Atualiza um card pelo id.
   * Pode atualizar colunaID, titulo e conteudo.
   */
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { colunaID?: number; conteudo?: string; titulo?: string },
  ) {
    return this.cardsService.update(id, body);
  }

  /**
   * Remove um card pelo id.
   */
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.cardsService.remove(id);
  }
}

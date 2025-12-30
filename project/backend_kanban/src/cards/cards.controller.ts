import { Controller, Post, Body, Patch, Param, Delete, ParseIntPipe } from "@nestjs/common";
import { CardService } from "./cards.service";

@Controller("cards")
export class CardController {
  constructor(private readonly cardsService: CardService) {}

  @Post()
  create(@Body() body: { titulo: string; conteudo: string; colunaID: number }) {
    console.log(body);
    // Passamos title e content
    return this.cardsService.create(body.titulo, body.conteudo, body.colunaID);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { colunaID?: number; conteudo?: string; titulo?: string },
  ) {
    return this.cardsService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.cardsService.remove(id);
  }
}

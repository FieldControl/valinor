import { Controller, Get, Post, Body, Delete, Param, ParseIntPipe } from "@nestjs/common";
import { ColumnService } from "./coluna.service";

/**
 * Controller para gerenciamento de colunas (listas) do kanban.
 * Comentários simples: considerar DTOs e validação para requests.
 */
@Controller("colunas")
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  /** Retorna todas as colunas com seus cards */
  @Get()
  findAll() {
    return this.columnService.findAll();
  }

  /** Cria uma nova coluna. body: { titulo } */
  @Post()
  create(@Body() body: { titulo: string }) {
    return this.columnService.create(body.titulo);
  }

  /** Remove uma coluna pelo id */
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.columnService.remove(id);
  }
}

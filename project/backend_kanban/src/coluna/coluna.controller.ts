import { Controller, Get, Post, Body, Delete, Param, ParseIntPipe } from "@nestjs/common";
import { ColumnService } from "./coluna.service";

@Controller("colunas")
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Get()
  findAll() {
    return this.columnService.findAll();
  }

  @Post()
  create(@Body() body: { titulo: string }) {
    return this.columnService.create(body.titulo);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.columnService.remove(id);
  }
}

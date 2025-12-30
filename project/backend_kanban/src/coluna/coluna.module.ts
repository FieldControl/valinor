import { Module } from "@nestjs/common";
import { ColumnService } from "./coluna.service";
import { ColumnController } from "./coluna.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Column } from "./entities/coluna.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Column])],
  controllers: [ColumnController],
  providers: [ColumnService],
})
export class ColunaModule {}

import { Module } from "@nestjs/common";
import { CardService } from "./cards.service";
import { CardController } from "./cards.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Card } from "./entities/card.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Card])],
  controllers: [CardController],
  providers: [CardService],
})
export class CardsModule {}

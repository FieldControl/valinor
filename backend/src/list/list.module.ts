/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Card, cardSchema } from './card/card';
import { ListService } from './list.service';
import { ListController } from './list.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Card.name,
        schema: cardSchema,
      },
    ]),
  ],
  exports: [],
  controllers: [ListController],
  providers: [ListService]
})
export class ListModule {}

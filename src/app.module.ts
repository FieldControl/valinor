import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CardsController } from './Controllers/cards/cards.controller';
import { CardsService } from './Services/cards/cards.service';
import { CardSchema } from './Mongo/Schemas/card.schema';
import { CardRepository } from './Mongo/Repository/card.repository';
import { ObjectId } from 'mongoose';

@Module({
  imports: [

    MongooseModule.forRoot('mongodb://localhost/kanban'),

    MongooseModule.forFeature([
      { name: 'card', schema: CardSchema }
    ])

  ],
  controllers: [CardsController],
  providers: [CardsService, CardRepository],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ColumnsModule } from './columns/columns.module';
import { CardsModule } from './cards/cards.module';

@Module({
  imports: [PrismaModule, ColumnsModule, CardsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
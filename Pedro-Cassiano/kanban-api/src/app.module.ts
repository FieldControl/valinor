import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ColumnsModule } from './columns/columns.module';
import { CardsModule } from './cards/cards.module';

@Module({
  imports: [
    ColumnsModule,
    CardsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
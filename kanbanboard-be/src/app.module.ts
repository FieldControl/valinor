import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ColumnsModule } from './columns/columns.module';
import { BoardModule } from './board/board.module';

@Module({
  imports: [ColumnsModule, BoardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CardModule } from './card/card.module';
import { FirebaseModule } from './firebase/firebase.module';
import { ColumnService } from './column/column.service';
import { ColumnModule } from './column/column.module';

@Module({
  imports: [CardModule, FirebaseModule, ColumnModule],
  controllers: [AppController],
  providers: [AppService, ColumnService],
})
export class AppModule {}

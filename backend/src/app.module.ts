import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { BoardModule } from './board/board.module';
import { SwimlaneModule } from './swimlane/swimlane.module';
import { CardModule } from './card/card.module';

@Module({
  imports: [UserModule, BoardModule, SwimlaneModule, CardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

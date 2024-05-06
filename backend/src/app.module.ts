import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KanbansModule } from './kanbans/kanbans.module';
import { KanbansController } from './kanbans/kanbans.controller';
import { KanbansService } from './kanbans/kanbans.service';


@Module({
  imports: [KanbansModule],
  controllers: [AppController,KanbansController],
  providers: [AppService,KanbansService],
})
export class AppModule {}

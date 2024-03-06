import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KanbansModule } from './kanbans/kanbans.module';

@Module({
  imports: [KanbansModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

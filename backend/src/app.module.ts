import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ColumnsModule } from './columns/columns.module';

@Module({
  imports: [ColumnsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

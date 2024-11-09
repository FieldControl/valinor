/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ListModule } from './list/list.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017/'), ListModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

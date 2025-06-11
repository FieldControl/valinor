import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ColumnsModule } from './columns/columns.module';
import { CardsModule } from './cards/cards.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ColumnsModule, CardsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

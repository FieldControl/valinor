import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './cards/cards.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UsersModule,
    CardsModule,
    TasksModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

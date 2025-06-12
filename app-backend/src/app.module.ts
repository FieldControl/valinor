import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ColumnsModule } from './columns/columns.module';
import { CardsModule } from './cards/cards.module';
import { LoggerMiddleware } from './commom/middleware/logger.middleware';

import { EventsGateway } from './events/events.gateway';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ColumnsModule, CardsModule],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

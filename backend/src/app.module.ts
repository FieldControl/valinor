import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KanbansModule } from './kanbans/kanbans.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MysqlConfigService } from './config/mysql.config.service';
import { ConfigModule } from '@nestjs/config';
import { CardsModule } from './cards/cards.module';
import { BadgesModule } from './badges/badges.module';
import { CorsMiddleware } from './cors.middleware';

@Module({
  imports: [
    KanbansModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      useClass: MysqlConfigService,
      inject: [MysqlConfigService]
    }),
    CardsModule,
    BadgesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*')
  }
}

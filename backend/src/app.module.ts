import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { KanbansModule } from './kanbans/kanbans.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MysqlConfigService } from './config/mysql.config.service';
import { ConfigModule } from '@nestjs/config';
import { CardsModule } from './cards/cards.module';
import { BadgesModule } from './badges/badges.module';
import { CorsMiddleware } from './cors.middleware';
import { APP_FILTER } from '@nestjs/core';
import { FilterExceptionsHttp } from './filters/filter-exceptions-http';
import { BadgeInit } from './badge-init';

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
  providers: [
    BadgeInit,
    {
      provide: APP_FILTER,
      useClass: FilterExceptionsHttp
    }
  ],
})
export class AppModule implements NestModule {
  
  constructor(
    private readonly badgeInit: BadgeInit
  ) { }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*')
  }

  async onModuleInit() {
    await this.badgeInit.initBadgesIfNeeded();
  }
}

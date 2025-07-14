import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ColumnsModule } from './columns/columns.module';
import { CardsModule } from './cards/cards.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { Column } from './columns/entities/column.entity';
import { Card } from './cards/entities/card.entity';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    // Regista o ConfigModule para que possamos usar variáveis de ambiente.
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configuração dinâmica do TypeORM.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // A 'useFactory' permite-nos construir a configuração dinamicamente.
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        
        // Verificamos se a variável de ambiente DATABASE_URL existe.
        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (databaseUrl) {
          // --- Configuração para Produção (PostgreSQL no Render) ---
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [Column, Card, User],
            synchronize: true, // Para o primeiro deploy, isto é útil.
            ssl: {
              rejectUnauthorized: false, // Necessário para a conexão com o Heroku/Render.
            },
          };
        } else {
          // --- Configuração para Desenvolvimento (SQLite local) ---
          return {
            type: 'sqlite',
            database: 'kanban.db',
            entities: [Column, Card, User],
            synchronize: true,
          };
        }
      },
    }),
    
    // Nossos outros módulos.
    ColumnsModule,
    CardsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
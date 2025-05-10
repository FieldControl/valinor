import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { CardModule } from './card/card.module';
import { ColumnModule } from './column/column.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
			sortSchema: true,
			playground: true,
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
				type: 'postgres',
				host: config.get<string>('DATABASE_HOST'),
				port: config.get<number>('DATABASE_PORT'),
				username: config.get<string>('DATABASE_USER'),
				password: config.get<string>('DATABASE_PASSWORD'),
				database: config.get<string>('DATABASE_NAME'),
				autoLoadEntities: true,
				synchronize: true,
			}),
		}),
		CardModule,
		ColumnModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }

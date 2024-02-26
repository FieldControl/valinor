import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { databaseProviders } from './db/database.providers';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [ProjectsModule],
  controllers: [AppController],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class AppModule {}

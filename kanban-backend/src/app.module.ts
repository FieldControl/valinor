import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://guilhermedf000:00FNl4hHuvIR1wWx@cluster0.zbqtqly.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'),
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

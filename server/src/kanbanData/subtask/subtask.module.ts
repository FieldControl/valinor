import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubtaskResolver } from './subtask.resolver';
import { SubtaskService } from './subtask.service';
import { Subtask, SubtaskSchema } from './subtask.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Subtask.name, schema: SubtaskSchema }]),
  ],
  providers: [SubtaskResolver, SubtaskService],
  exports: [SubtaskService],
})
export class SubtaskModule {}

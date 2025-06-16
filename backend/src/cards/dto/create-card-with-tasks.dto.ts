import { IsString, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class TaskInput {
  @IsString()
  description: string;
}

export class CreateCardDto {
  @IsString()
  title: string;

  @IsInt()
  memberId: number; // <- Para quem o card será enviado

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskInput)
  tasks: TaskInput[];
}

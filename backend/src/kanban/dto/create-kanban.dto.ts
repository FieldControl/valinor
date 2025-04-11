import { IsNumber, IsString } from 'class-validator';

export class CreateKanbanDto {
  @IsString()
  item: string;

  @IsNumber()
  id: number;
}

import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class TasksDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  columnId?: string;
}

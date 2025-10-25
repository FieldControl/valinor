import { CardPriority } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCardDto {

  @IsString()
  title: string;

  @IsNumber()
  columnId: number;

  @IsOptional()
  @IsEnum(CardPriority)
  priority?: CardPriority;
}

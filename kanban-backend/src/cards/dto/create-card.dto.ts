import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum CardPriority {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
}

export class CreateCardDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;

  @IsEnum(CardPriority)
  priority: CardPriority;

  @IsNotEmpty()
  columnId: number;
}

import { IsOptional, IsEnum } from 'class-validator';
import { CardPriority } from './create-card.dto';

export class UpdateCardDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(CardPriority)
  priority?: CardPriority;
}
import { InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateCardInput {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Este campo não pode estar vazio' })
  title?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Este campo não pode estar vazio' })
  description?: string;
}

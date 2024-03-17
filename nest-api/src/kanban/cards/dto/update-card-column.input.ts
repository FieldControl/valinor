import { InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateColumnToCardInput {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Este campo não pode estar vazio' })
  column?: string;
}

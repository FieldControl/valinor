import { InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateUserToCardInput {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Este campo não pode estar vazio' })
  user?: string;
}

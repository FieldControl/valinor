import { InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @IsString()
  @IsNotEmpty({ message: 'Este campo não pode estar vazio' })
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty({ message: 'Este campo não pode estar vazio' })
  @IsEmail()
  @IsOptional()
  email?: string;
}

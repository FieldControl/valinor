import { InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateColumnInput {
  @IsString()
  @IsNotEmpty({ message: 'Este campo não pode estar vazio' })
  title: string;
}

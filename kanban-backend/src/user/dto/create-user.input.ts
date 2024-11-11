import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Este campo é obrigatório.' })
  name: string;

  @Field()
  @IsEmail()
  @IsNotEmpty({ message: 'Este campo é obrigatório.' })
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Este campo é obrigatório.' })
  password: string;
}

import { InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateUserInput {
  @IsString()
  @IsNotEmpty({ message: 'Invalid characters' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Invalid E-mail' })
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

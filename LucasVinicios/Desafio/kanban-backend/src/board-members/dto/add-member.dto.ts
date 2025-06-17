
import { IsNotEmpty, IsEmail, IsNumber } from 'class-validator';

export class AddMemberDto {
  @IsNotEmpty()
  @IsEmail()
  email: string; 
}
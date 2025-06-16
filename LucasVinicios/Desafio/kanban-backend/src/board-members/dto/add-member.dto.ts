// src/board-members/dto/add-member.dto.ts
import { IsNotEmpty, IsEmail, IsNumber } from 'class-validator';

export class AddMemberDto {
  @IsNotEmpty()
  @IsEmail()
  email: string; // Adicionar membro pelo email
}
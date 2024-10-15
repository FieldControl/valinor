import { IsNotEmpty, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterUserDto {
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  @MinLength(6) @MaxLength(12)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: "A senha é muito fraca. Por favor, escolha uma senha mais forte, contendo entre 6 e 12 caracteres"
  })
  password: string;
}
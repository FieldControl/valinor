/*
  A classe `CreateUserDto` define o formato dos dados necessários para criar um novo usuário.
  Ela serve como um "molde" para receber e validar informações ao criar um usuário, garantindo
  que os dados incluam `email`, `password`, `firstName` e `lastName` antes de serem processados.
*/
export class CreateUserDto {
  emailUser: string;
  passwordUser: string;
  firstName: string;
  lastName: string;
}

/**
 * RegisterAuthDto (Data Transfer Object)
 * Define a "forma" dos dados que um cliente deve enviar para se registar.
 * Usar um DTO garante que apenas os campos esperados (email e password)
 * sejam processados pelo nosso controller.
 */
export class RegisterAuthDto {
  email: string;
  password: string;
}
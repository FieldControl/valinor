/**
 * CreateUserDto (Data Transfer Object)
 * Define a estrutura de dados necessária para criar uma nova entidade User.
 * Esta classe é usada internamente para garantir que apenas os dados corretos
 * sejam passados para o serviço que interage com o banco de dados.
 */
export class CreateUserDto {
  email: string;
  password: string; // Espera-se que esta senha já esteja criptografada (hashed).
}
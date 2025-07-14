// Importa os decorators e classes de exceção do NestJS.
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
// Importa o serviço de usuários para interagir com o banco de dados.
import { UsersService } from 'src/users/users.service';
// Importa o serviço do JWT para criar os tokens.
import { JwtService } from '@nestjs/jwt';
// Importa a biblioteca 'bcrypt' para criptografia de senhas.
import * as bcrypt from 'bcrypt';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

/**
 * @Injectable() marca esta classe para ser gerenciada pelo sistema de
 * Injeção de Dependência do NestJS.
 */
@Injectable()
export class AuthService {
  /**
   * O construtor injeta as dependências que este serviço necessita.
   * @param usersService - Para criar e buscar usuários.
   * @param jwtService - Para criar os tokens de acesso.
   */
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registra um novo usuário no sistema de forma segura.
   * @param registerAuthDto - Dados do usuário (email e senha) vindos do controller.
   * @returns O objeto do usuário criado (sem a senha).
   * @throws {ConflictException} Se o email já estiver em uso.
   */
  async register(registerAuthDto: RegisterAuthDto) {
    // 1. Verifica se já existe um usuário com o mesmo email.
    const existingUser = await this.usersService.findOne(registerAuthDto.email);
    if (existingUser) {
      // Lança uma exceção HTTP 409 (Conflict) se o email já existir.
      throw new ConflictException('Este email já está em uso.');
    }

    // 2. Criptografa a senha do usuário.
    // NUNCA guarde senhas em texto plano. O 'bcrypt' cria um "hash" seguro da senha.
    // O '10' é o "salt round", que define a complexidade (e o tempo) da criptografia.
    const hashedPassword = await bcrypt.hash(registerAuthDto.password, 10);

    // 3. Cria o novo usuário no banco de dados com a senha já criptografada.
    const user = await this.usersService.create({
      email: registerAuthDto.email,
      password: hashedPassword,
    });

    // 4. Remove a propriedade da senha do objeto antes de retorná-lo.
    // É uma boa prática de segurança nunca expor a senha, mesmo que seja o hash.
    const { password, ...result } = user;
    return result;
  }

  /**
   * Valida as credenciais de um usuário e retorna um token de acesso JWT.
   * @param loginAuthDto - Dados de email e senha para o login.
   * @returns Um objeto contendo o 'access_token'.
   * @throws {UnauthorizedException} Se as credenciais forem inválidas.
   */
  async login(loginAuthDto: LoginAuthDto) {
    // 1. Encontra o usuário no banco de dados pelo email fornecido.
    const user = await this.usersService.findOne(loginAuthDto.email);

    // 2. Compara a senha enviada com a senha criptografada no banco.
    // 'bcrypt.compare' faz essa verificação de forma segura.
    // Se o usuário não for encontrado OU a senha não bater, lança um erro.
    if (!user || !(await bcrypt.compare(loginAuthDto.password, user.password))) {
      // Lança uma exceção HTTP 401 (Unauthorized).
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    // 3. Se as credenciais estiverem corretas, preparamos o "payload" do token.
    // O payload são as informações que queremos guardar dentro do token.
    // 'sub' (subject) é o padrão para guardar a ID do usuário.
    const payload = { sub: user.id, email: user.email };

    // 4. Gera o token JWT assinado com nossa chave secreta e retorna.
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
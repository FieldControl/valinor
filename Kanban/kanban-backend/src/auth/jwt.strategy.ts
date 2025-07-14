import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

/**
 * @Injectable() marca esta classe para ser gerida pelo sistema de
 * Injeção de Dependência do NestJS.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * O construtor da nossa estratégia.
   * @param usersService - Injetamos o UsersService para podermos buscar os dados do utilizador
   * após a validação do token.
   */
  constructor(private readonly usersService: UsersService) {
    // A chamada 'super()' invoca o construtor da classe 'Strategy' que estamos a estender.
    // É aqui que configuramos como o token será extraído e verificado.
    super({
      // Define que o token JWT será extraído do cabeçalho de autorização
      // no formato "Bearer <token>". Esta é a forma padrão.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Garante que o Passport não aceite tokens que já expiraram.
      ignoreExpiration: false,
      // A mesma chave secreta usada para assinar o token no 'auth.module.ts'.
      // É crucial que esta chave seja a mesma para que a verificação funcione.
      // Em produção, carregar de uma variável de ambiente é obrigatório.
      secretOrKey: 'qwervtyuiopasqdsfghjklçzxcvbfGABRIELFERNANDESRIGUETTOnmmdvgnbvcsxzçlkjhgfdsdapofiuytrewq',
    });
  }

  /**
   * Este método é chamado automaticamente pelo PassportJS DEPOIS de ele ter
   * verificado a assinatura e a expiração do token com sucesso.
   * O 'payload' é o conteúdo decifrado do token, que nós definimos no AuthService.
   * @param payload - O conteúdo do token JWT (ex: { sub: 1, email: '...' }).
   * @returns O objeto do utilizador (sem a senha), que o NestJS irá anexar ao objeto 'request' da rota.
   */
  async validate(payload: { sub: number; email: string }) {
    // Usamos a ID (sub) do payload para buscar o utilizador completo no banco de dados.
    // Isto é uma verificação de segurança importante para garantir que o utilizador ainda existe.
    const user = await this.usersService.findOneById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Token inválido ou utilizador não encontrado.');
    }

    // Retorna o objeto do utilizador, que ficará disponível em 'req.user' nos nossos controllers.
    const { password, ...result } = user;
    return result;
  }
}
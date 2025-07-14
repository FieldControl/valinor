import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard é um "Guarda de Rota" que protege os endpoints.
 * * Ao estender AuthGuard('jwt'), ele automaticamente invoca a nossa JwtStrategy.
 * * O fluxo é o seguinte:
 * 1. Uma requisição chega a uma rota protegida por este guarda.
 * 2. O guarda ativa a JwtStrategy.
 * 3. A JwtStrategy extrai e valida o token JWT do cabeçalho da requisição.
 * 4. Se o token for válido, o método 'validate' da estratégia é executado.
 * 5. Se 'validate' retornar um utilizador, o guarda permite o acesso à rota.
 * 6. Se em qualquer ponto a validação falhar, o guarda bloqueia a requisição
 * automaticamente, retornando um erro HTTP 401 Unauthorized.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}   
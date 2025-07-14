import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth';

/**
 * authInterceptor é uma "Função de Interceção de HTTP" (HttpInterceptorFn).
 * Esta função é executada para CADA requisição HTTP que sai da nossa aplicação.
 *
 * @param req - O objeto da requisição original que está a ser enviada.
 * @param next - Um manipulador que representa a próxima etapa no pipeline de interceção.
 * Chamar 'next(req)' envia a requisição para o seu destino.
 * @returns Um Observable da resposta do evento HTTP.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Injetamos o nosso AuthService para termos acesso ao token guardado.
  const authService = inject(AuthService);
  const authToken = authService.getToken();

  // 2. Se não houver token (ex: o utilizador ainda não fez login ou a requisição
  //    é para a própria página de login), simplesmente deixamos a requisição
  //    original seguir o seu caminho sem modificações.
  if (!authToken) {
    return next(req);
  }

  // 3. Se houver um token, clonamos a requisição original e adicionamos
  //    o cabeçalho (Header) de autorização. As requisições são imutáveis,
  //    por isso temos que criar um clone em vez de modificar a original.
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${authToken}`),
  });

  // 4. Deixamos a NOVA requisição (com o cabeçalho de autorização) seguir o seu caminho.
  //    Agora, o nosso backend receberá o token e o nosso JwtAuthGuard poderá validá-lo.
  return next(authReq);
};
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // Importa o JWTService para verificar o token JWT.

export interface PayloadRequest extends Request { // Define a interface PayloadRequest que estende a interface Request padrão.
  user: { 
    email: string;
    id: number;
  };
}

@Injectable() // Marca a classe como um provedor injetável, permitindo que seja usada em outros lugares, como em controladores ou outros serviços.
export class AuthGuard implements CanActivate { // Implementa a interface CanActivate na classe AuthGuard, que define o método canActivate.
  constructor(private jwtService: JwtService) {} // Injeta o JwtService no construtor, permitindo que a classe use o serviço para verificar tokens JWT.

  async canActivate(context: ExecutionContext): Promise<boolean> { // Verifica se a requisição está autorizada.

    const ctx = context.switchToHttp(); // Converte o contexto de execução para o contexto HTTP.
    const request = ctx.getRequest(); // Obtém o objeto de requisição HTTP.
    const token = this._extractTokenFromHeader(request); // Extrai o token do cabeçalho da requisição.

    // Verifica se o token existe. Se não existir, lança uma exceção UnauthorizedException.
    if (!token) {
      throw new UnauthorizedException('Acesso não autorizado');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token); // Verifica o token usando o JwtService.
      request.user = payload; // Se o token for válido, adiciona o payload à requisição.
    } catch (error) {
      throw new UnauthorizedException('Acesso não autorizado');
    }

    return true; // Retorna true se o token for válido, permitindo o acesso à rota protegida.
  }

  private _extractTokenFromHeader(request: Request): string | undefined { // Método privado para extrair o token do cabeçalho da requisição.
    const authHeader = request.headers['authorization']; // Obtém o cabeçalho de autorização da requisição.

    // Verifica se o cabeçalho de autorização existe. Se não existir, retorna undefined.
    if (!authHeader) {
      return undefined; // Se o cabeçalho não estiver correto, retorna undefined.
    }
    return authHeader.split(' ')[1]; // Divide o cabeçalho em partes e retorna a segunda parte, que é o token.
  }
}

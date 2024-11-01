import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Interface para o Request, incluindo o usuário
export interface PayloadRequest extends Request {
  user: {
    email: string;
    id: number;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  // Método que verifica se o acesso é permitido
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest(); // Obtém a requisição HTTP
    const token = this._extractTokenFromHeader(request); // Extrai o token do cabeçalho

    // Verifica se o token está presente
    if (!token) {
      throw new UnauthorizedException('Unauthorized access');
    }

    try {
      // Verifica e decodifica o token JWT
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload; // Armazena o payload decodificado na requisição
    } catch (error) {
      throw new UnauthorizedException('Unauthorized access');
    }

    return true; // Permite o acesso se o token for válido
  }

  // Método privado para extrair o token do cabeçalho da requisição
  private _extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    // Verifica se o cabeçalho de autorização está presente
    if (!authHeader) {
      return undefined;
    }
    // Retorna o token removendo o prefixo "Bearer "
    return authHeader.split(' ')[1];
  }
}

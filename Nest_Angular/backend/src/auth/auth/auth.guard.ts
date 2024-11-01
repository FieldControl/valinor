import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface PayloadRequest extends Request {
  user: {
    email: string;
    id: number;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) { }


  // Se o token estiver ausente ou for inválido, uma UnauthorizedException é lançada.
  // Se o token for válido, o payload é anexado ao objeto de requisição.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this._extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Unauthorized access');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
    } catch (error) {
      throw new UnauthorizedException('Unauthorized access');
    }

    return true;
  }

  //  Extrai o token do cabeçalho de autorização da requisição.

  private _extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return undefined;
    }
    return authHeader.split(' ')[1];
  }
}

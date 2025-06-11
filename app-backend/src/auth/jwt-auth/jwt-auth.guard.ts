import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface JwtPayload {
  sub: number;
  email: string;
  tipo: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;
    if (!authHeader) return false;

    const [, token] = authHeader.split(' ');
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      request.user = payload; // agora tipado
      return true;
    } catch {
      return false;
    }
  }
}

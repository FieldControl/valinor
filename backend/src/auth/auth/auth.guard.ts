import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwkKeyExportOptions } from 'crypto';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
  ){}


  // Simulando uma authenticação/autorização, se no request tiver o header 'authorization' é como se fosse um token
  // do usuario com seu id e permissões, mas na verdade para demonstrar o que fica guardado lá vai ser só o
  // usuarioId
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extracTokenFromHeader(request);

    if(!token){
      throw new UnauthorizedException('Acesso não autorizado')
    }
    
    return true;
  }


  private extracTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    if(!authHeader){
      return undefined;
    }
    return authHeader;
  }
}

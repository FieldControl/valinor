import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Request } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface payloudRequest extends Request{
  user : {email: string;
  id: number;}
}

@Injectable()
export class  AuthGuard implements CanActivate {
  constructor( private jwtService : JwtService ) { }

  async canActivate( context: ExecutionContext, ): Promise<boolean>  {

    const request = context.switchToHttp().getRequest();
    const token = this._extractTokenFromHeader(request);

    if(!token){
      //throw new UnauthorizedException('acesso não autorizado')
      console.log('acesso não autorizado por falta do token')
    }

    try {
      const payloud = await this.jwtService.verifyAsync(token);
      request.user = payloud
      return true;
    } catch (error){
      throw new UnauthorizedException('Acesso não autorizado')
    }

    return true;
    
}

  private _extractTokenFromHeader(request: Request): string | undefined{
    const authHeader = request.headers['authorization'];
    if (!authHeader){
      console.log('token indefinido')
      return undefined
      
    }
    return authHeader.split(' ')[1];
  }
}

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '@application/services/auth.service';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return false;
    }

    const user = await this.authService.validateToken(authHeader);

    if (!user) {
      return false;
    }

    req.user = user;
    return true;
  }
}

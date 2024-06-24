import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '@application/services/auth.service';
export declare class AuthGuard implements CanActivate {
    private readonly authService;
    constructor(authService: AuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}

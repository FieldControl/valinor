import { LoginUserInput } from '@application/dto/userDto/login-user.input';
import { AuthService } from '@application/services/auth.service';
import { User } from '@domain/entities/user.entity';
export declare class AuthResponse {
    access_token: string;
    user: User;
}
export declare class AuthResolver {
    private readonly authService;
    constructor(authService: AuthService);
    loginUser(loginUserInput: LoginUserInput): Promise<AuthResponse>;
}

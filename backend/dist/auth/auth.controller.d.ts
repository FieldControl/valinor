import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserService } from 'src/user/user.service';
export declare class AuthController {
    private readonly authService;
    private userService;
    constructor(authService: AuthService, userService: UserService);
    create(registerDto: RegisterDto): Promise<{
        accessToken: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
    }>;
}

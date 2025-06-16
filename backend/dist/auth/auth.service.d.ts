import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(username: string, password: string): Promise<{
        id: number;
        username: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    login(user: any): Promise<{
        access_token: string;
    }>;
}

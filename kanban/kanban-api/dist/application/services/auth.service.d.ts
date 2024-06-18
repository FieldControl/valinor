import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@infra/data/client/prisma.service';
import { LoginUserInput } from '@application/dto/userDto/login-user.input';
export declare class AuthService {
    private readonly prismaService;
    private readonly jwtService;
    constructor(prismaService: PrismaService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(input: LoginUserInput): Promise<{
        access_token: string;
        user: any;
    }>;
    validateToken(token: string): Promise<any>;
}

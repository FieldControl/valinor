import { UsersService } from './users.service';
import { Role } from '@prisma/client';
declare class RegisterDto {
    username: string;
    email: string;
    password: string;
    role: Role;
}
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    register(data: RegisterDto): Promise<{
        id: number;
        username: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
}
export {};

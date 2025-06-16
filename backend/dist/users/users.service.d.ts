import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';
type UserWithoutPassword = Omit<User, 'password'>;
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    createUser(username: string, email: string, password: string, role: Role): Promise<User>;
    findAllMembers(): Promise<UserWithoutPassword[]>;
    findByUsername(username: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
}
export {};

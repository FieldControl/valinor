import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    createUser(username: string, email: string, password: string, role: Role): Promise<User>;
    findByUsername(username: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
}

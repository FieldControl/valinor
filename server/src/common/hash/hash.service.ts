import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
    private readonly saltRounds = 10;

    async hashPassword (password: string): Promise<string>{
        return bcrypt.hash(password, this.saltRounds);
    }

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}

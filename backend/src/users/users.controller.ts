import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';

class RegisterDto {
  username: string;
  email: string;
  password: string;
  role: Role;
}

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
    async register(@Body() data: RegisterDto) {
    try {
        const user = await this.usersService.createUser(data.username, data.email, data.password, data.role);
        return { id: user.id, username: user.username, email: user.email, role: user.role };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new BadRequestException('Username or email already exists');
            }
        }
        throw error;
    }
}
}

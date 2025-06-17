import { Body, Controller, Post, BadRequestException, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Prisma } from '@prisma/client';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsString } from 'class-validator';

class RegisterDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(Role)
  role: Role;
}

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LEADER')
  @Get('members')
  async getMembers() {
    return this.usersService.findAllMembers();
  }

  @Post('register')
  async register(@Body() data: RegisterDto) {
    console.log('Payload recebido no register:', data);
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

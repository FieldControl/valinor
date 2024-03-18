import { Body, Controller, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from './users.service';
import { Public } from 'src/infra/auth/public';

interface UserRequest {
  email: string;
  password: string;
  name: string;
}

interface UserResponse {
  user: Omit<User, 'password'>;
}

@Controller('accounts')
@Public()
export class UserController {
  constructor(private usersService: UsersService) {}
  @Post()
  async create(
    @Body()
    { email, password, name }: UserRequest,
  ): Promise<UserResponse> {
    const user = await this.usersService.createUsers({
      email,
      password,
      name,
    });

    return { user };
  }
}

import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticateService } from './authenticate-user.service';
import { Public } from 'src/infra/auth/public';

interface AuthenticateRequest {
  email: string;
  password: string;
  name: string;
}

@Controller('sessions')
@Public()
export class AuthenticateController {
  constructor(private authenticateService: AuthenticateService) {}
  @Post()
  async create(
    @Body()
    { email, password, name }: AuthenticateRequest,
  ) {
    const token = await this.authenticateService.createAuth({
      email,
      password,
      name,
    });

    return { token };
  }
}

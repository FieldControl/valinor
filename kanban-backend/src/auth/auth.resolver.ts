import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthInput } from './dto/auth.input';
import { AuthType } from './dto/auth.type';
import { SignupInput } from './dto/auth.signup';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthType)
  public async signup(@Args('data') data: SignupInput): Promise<AuthType> {
    const response = await this.authService.signup(data);
    return {
      user: response.user,
      token: response.token,
    };
  }

  @Mutation(() => AuthType)
  public async login(@Args('data') data: AuthInput): Promise<AuthType> {
    const response = await this.authService.validateUser(data);
    return {
      user: response.user,
      token: response.token,
    };
  }

  @Mutation(() => Boolean)
  public async logout(@Args('userId') userId: number): Promise<boolean> {
    return this.authService.logout(userId);
  }
}

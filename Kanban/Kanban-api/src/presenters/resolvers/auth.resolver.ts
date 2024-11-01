import { LoginUserInput } from '@application/dto/userDto/login-user.input';
import { AuthService } from '@application/services/auth.service';
import { User } from '@domain/entities/user.entity';
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { ObjectType, Field } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';

@ObjectType()
export class AuthResponse {
  @Field()
  access_token: string;

  @Field(() => User)
  user: User;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async loginUser(
    @Args('loginUserInput') loginUserInput: LoginUserInput,
  ): Promise<AuthResponse> {
    const response = await this.authService.login(loginUserInput);

    return response;
  }
}

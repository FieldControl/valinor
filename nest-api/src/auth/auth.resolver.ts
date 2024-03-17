import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthInput } from './dto/auth.input';
import { AuthType } from './dto/auth.type';
import { RefreshTokenType } from './dto/refreshToken.type';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthType)
  public async login(
    @Args('data') data: AuthInput,
    @Context() context: { res: Response },
  ): Promise<AuthType> {
    const { token, user } = await this.authService.validateUser(
      data,
      context.res,
    );

    return {
      user: user,
      token: token,
    };
  }

  @Mutation(() => RefreshTokenType)
  public async revalidateToken(
    @Context() context: { res: Response; req: Request },
  ): Promise<RefreshTokenType> {
    const response = await this.authService.revalidateToken(
      context.req,
      context.res,
    );

    return {
      token: response.token,
    };
  }
}

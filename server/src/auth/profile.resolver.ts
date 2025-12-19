import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver()
export class ProfileResolver {
  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: any) {
    return user;
  }
}

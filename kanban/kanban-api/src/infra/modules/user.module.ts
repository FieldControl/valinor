import { Module } from '@nestjs/common';
import { UserService } from '../../application/services/user.service';
import { UserResolver } from '../../presenters/resolvers/user.resolver';
import { AuthModule } from './auth.module';
import { AuthGuard } from '@guard//auth.guard';

@Module({
  imports: [AuthModule],
  providers: [UserResolver, UserService, AuthGuard],
})
export class UserModule {}

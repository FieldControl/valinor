import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    PassportModule
  ],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}

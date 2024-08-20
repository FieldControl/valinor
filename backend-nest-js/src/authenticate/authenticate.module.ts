import { Module } from '@nestjs/common';
import { AuthenticateService } from './authenticate.service';
import { AuthenticateController } from './authenticate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthenticateController],
  providers: [AuthenticateService],
  imports: [TypeOrmModule.forFeature([User]), JwtModule.register({
    global: true,
    secret: 'secretKey',
    signOptions: {expiresIn: '8h'}
  })]
})
export class AuthenticateModule {}

import { Module } from '@nestjs/common';
import { AuthenticateService } from './authenticate.service';
import { AuthenticateController } from './authenticate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [AuthenticateController],
  providers: [AuthenticateService],
  imports: [UserModule, TypeOrmModule.forFeature([User]), JwtModule.register({
    global: true,
    secret: 'secretKey',
    signOptions: {expiresIn: '8h'}
  })]
})
export class AuthenticateModule {}

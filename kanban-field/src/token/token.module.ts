import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { TokenService } from './token.service';
import { Token, TokenSchema } from './token.entity';
import { TokenController } from './token.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
            forwardRef(() => AuthModule),
            forwardRef(() => UsersModule)],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService]
})
export class TokenModule {}

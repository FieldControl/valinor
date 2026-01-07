import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { HashModule } from 'src/common/hash/hash.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [HashModule, PrismaModule],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}

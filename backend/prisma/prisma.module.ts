import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

//arquivo para o Prisma sobre os providers e exports
@Module({
  providers: [PrismaService],
  exports: [PrismaService], 
})
export class PrismaModule {}

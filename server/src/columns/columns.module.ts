import { PrismaService } from '../../prisma.service.js';

import { Module } from '@nestjs/common';

import { ColumnsService } from './columns.service.js';
import { ColumnsResolver } from './columns.resolver.js';

@Module({
  providers: [PrismaService, ColumnsResolver, ColumnsService],
})
export class ColumnsModule {}

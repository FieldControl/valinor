import { ColumnService } from '@application/services/column.service';
import { AuthGuard } from '@guard//auth.guard';
import { Module } from '@nestjs/common';
import { ColumnResolver } from '@resolvers/column.resolver';
import { AuthModule } from './auth.module';

@Module({
  imports: [AuthModule],
  providers: [ColumnResolver, ColumnService, AuthGuard],
})
export class ColumnModule {}

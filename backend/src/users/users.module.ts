import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver'; // Se tiver resolver, mantenha
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersResolver, UsersService],
  exports: [UsersService] // <--- ADICIONE ESTA LINHA (Permite que o Auth use o UsersService)
})
export class UsersModule {}
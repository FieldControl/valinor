import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';

import { UserService } from '../services/user.service';
import { UserEntity } from '../entities/user.entity';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    async getAllUsers(): Promise<UserEntity[]> {
        return this.userService.findAll();
    }

    @Get(':id')
    async getUserById(@Param('id') id: number): Promise<UserEntity> {
        return this.userService.findById(id);
    }

    @Get('email/:email')
    async getUserByEmail(@Param('email') email: string): Promise<UserEntity> {
        return this.userService.findByEmail(email);
    }

    @Post()
    async create(@Body() user: UserEntity): Promise<UserEntity> {
        return this.userService.create(user);
    }

    @Put(':id')
    async updateUser(@Param('id') id: number, @Body() user: UserEntity): Promise<UserEntity> {
        return this.userService.update(id, user);
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: number): Promise<void> {
        return this.userService.delete(id);
    }
}

import { Controller, Get, Post, Body, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard, payloudRequest } from 'src/authenticate/auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard)
  findOne(
    @Request() req: payloudRequest) {
    return this.userService.findOne(req.user.id);
  }

  @Patch()
  @UseGuards(AuthGuard)
  update(
    @Request() req: payloudRequest, 
    @Body() updateUserDto: UpdateUserDto) {
    return this.userService.UpdateUserInformation( req.user.id, updateUserDto);
  }

  @Delete()
  @UseGuards(AuthGuard)
  remove(
    @Request() req: payloudRequest) {
    return this.userService.remove(req.user.id);
  }
}

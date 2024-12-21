import {
  Body,
  Controller,
  Delete,
  NotFoundException,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { Users } from "../models/user.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Controller("/user")
export class UserController {
  @Post()
  async postUsers(@Body() body: Users) {
    const user = new Users(null, body.name, body.email, body.password);
    return await new Users().postUser(user);
  }
  @Put("/:id")
  async putUser(@Param("id") id: string, @Body() body: Users) {
    console.log(body);
    console.log(id);
    try {
      const user = new Users(id, body.name, body.email, body.password);
      console.log(user);
      return await new Users().putUser(user);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException("Usuário não encontrado");
      }
      throw error;
    }
  }
  @Delete("/:id")
  async deleteUser(@Param("id") id: string) {
    return await new Users().deleteUser(id);
  }
  @Post("/login")
  async login(@Body() body: Users) {
    return await new Users().login(body.email, body.password);
  }
}

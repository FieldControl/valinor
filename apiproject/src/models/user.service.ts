import { randomUUID } from "crypto";
import { PrismaService } from "src/database/prisma.service";

export class Users {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  constructor(id?: string, name?: string, email?: string, password?: string) {
    this.id = id ? id : randomUUID();
    this.name = name;
    this.email = email;
    this.password = password;
  }
  async postUser(user: Users) {
    const prisma = new PrismaService();
    const newUser = await prisma.users.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });
    return {
      newUser,
    };
  }
  async putUser(user: Users) {
    const prisma = new PrismaService();
    console.log(user);

    const updateUser = await prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });
    return {
      updateUser,
    };
  }

  async deleteUser(id: string) {
    const prisma = new PrismaService();
    try {
      const deleteUser = await prisma.users.delete({
        where: {
          id: id,
        },
      });
      return {
        deleteUser,
      };
    } catch (error) {
      console.log(error);
      return {
        error: error,
      };
    }
  }
  async login(email: string, password: string) {
    const prisma = new PrismaService();
    const user = await prisma.users.findFirst({
      where: {
        email: email,
        password: password,
      },
    });
    return {
      user,
    };
  }
}

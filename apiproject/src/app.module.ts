import { Module } from "@nestjs/common";
import { TaskController } from "./controllers/task.controller";
import { UserController } from "./controllers/user.controller";
import { PrismaService } from "./database/prisma.service";
import { Users } from "./models/user.service";
import { Task } from "./models/task.service";

@Module({
  imports: [],
  controllers: [UserController, TaskController],
  providers: [PrismaService, Users, Task],
})
export class AppModule {}

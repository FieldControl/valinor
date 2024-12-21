/* eslint-disable prettier/prettier */
import { Controller, Delete, Put } from "@nestjs/common";
import { Get, Post, Body, Param } from "@nestjs/common";
import { Task } from "src/models/task.service";
@Controller("/task")
export class TaskController {
  @Post()
  async postTask(@Body() body: Task) {
    console.log(body);
    const task = new Task(
      "",
      body.title,
      body.description,
      body.userId,
      body.status,
      null
    );
    console.log(task);
    return await new Task().postTask(task);
  }

  @Get("/:id")
  async getTasks(@Param("id") id: string) {
    return await new Task().getTasksByUserId(id);
  }
  @Put("/:id")
  async putTask(@Param("id") id: string, @Body() body: Task) {
    const task = new Task(
      id,
      body.title,
      body.description,
      body.userId,
      body.status,
      body.data,
    );
    return await new Task().putTask(task);
  }
  @Delete("/:id")
  async deleteTask(@Param("id") id: string) {
    return await new Task().deleteTask(id);
  }
}
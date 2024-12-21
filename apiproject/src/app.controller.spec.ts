import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./controllers/user.controller";
import { PrismaService } from "./database/prisma.service";

describe("AppController", () => {
  let appController: UserController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [PrismaService],
    }).compile();

    appController = app.get<UserController>(UserController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      expect(appController.getUsers()).toBe("");
    });
  });
});

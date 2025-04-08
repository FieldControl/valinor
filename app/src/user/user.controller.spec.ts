import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

// Os arquivos .spec são arquivos de teste que contêm casos de teste para o código do aplicativo. Eles são usados para garantir que o código funcione conforme o esperado e para detectar possíveis erros ou regressões no futuro. Os arquivos .spec.ts geralmente são criados junto com os arquivos de código-fonte correspondentes e seguem a mesma estrutura de diretório. Eles são executados usando um framework de teste, como o Jest, que é integrado ao NestJS por padrão. Os testes podem incluir casos de teste unitários, testes de integração e testes de ponta a ponta, dependendo da complexidade do aplicativo e dos requisitos de teste.
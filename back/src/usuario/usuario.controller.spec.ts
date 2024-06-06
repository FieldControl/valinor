import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../auth/auth/auth.guard';

// Mock for the Authentication Guard
jest.mock('../auth/auth/auth.guard', () => ({
  AuthGuard: jest.fn().mockImplementation(() => (req, res, next) => {
    req['usuario'] = { id: 1 }; // Mock user payload
    next();
  }),
  PayloadRequest: jest.fn()
}));

describe('UsuarioController', () => {
  let app: INestApplication;
  let usuarioService: UsuarioService;

  const mockUserData = {
    id: 1,
    nome: 'John Doe',
    email: 'johndoe@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        {
          provide: UsuarioService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUserData),
            update: jest.fn().mockResolvedValue(mockUserData),
            remove: jest.fn().mockResolvedValue(mockUserData),
          },
        },
      ],
    }).compile();

    usuarioService = module.get<UsuarioService>(UsuarioService);
    app = module.createNestApplication();
    await app.init();
  });

  it('should get a user (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/usuario');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUserData);
    expect(usuarioService.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a user (PATCH)', async () => {
    const updateData: UpdateUsuarioDto = { primeiroNome: 'Jane', ultimoNome: 'Doe' };
    const response = await request(app.getHttpServer()).patch('/usuario').send(updateData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUserData);
    expect(usuarioService.update).toHaveBeenCalledWith(1, updateData);
  });

  it('should remove a user (DELETE)', async () => {
    const response = await request(app.getHttpServer()).delete('/usuario');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUserData);
    expect(usuarioService.remove).toHaveBeenCalledWith(1);
  });

  it('should throw UnauthorizedException if no auth (GET)', async () => {
    // Mock the entire AuthGuard class
    const mockAuthGuard = {
      canActivate: jest.fn().mockRejectedValue(new UnauthorizedException()), // Reject with UnauthorizedException
    };
  
    // Provide the mock AuthGuard to the testing module
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        {
          provide: UsuarioService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUserData),
            // ... other service methods
          },
        },
        {
          provide: AuthGuard, 
          useValue: mockAuthGuard, 
        },
      ],
    }).compile();
  
    // Re-create the app and get the controller
    app = module.createNestApplication();
    await app.init();
    // let controller = module.get<UsuarioController>(UsuarioController);
  
    const response = await request(app.getHttpServer()).get('/usuario');
  
    expect(response.status).toBe(401); 
    expect(mockAuthGuard.canActivate).toHaveBeenCalled(); // Ensure the mock was called
  });

  // Add more tests for error scenarios, 
  // such as user not found, validation errors, etc.
});
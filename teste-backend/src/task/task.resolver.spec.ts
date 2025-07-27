import { Test, TestingModule } from '@nestjs/testing';
import { TaskResolver } from './task.resolver';
import { TaskService } from './task.service';
import { Task } from './entities/task.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';

describe('TaskResolver', () => {
  let resolver: TaskResolver;
  let service: TaskService;

  const mockTask: Task = {
    id: 1,
    name: 'Test Task',
    desc: 'Test description',
    step: 0,
  };

  const mockService = {
    create: jest.fn().mockReturnValue(mockTask),
    findAll: jest.fn().mockReturnValue([mockTask]),
    findOne: jest.fn().mockReturnValue(mockTask),
    findTasksByStep: jest.fn().mockReturnValue([mockTask]),
    update: jest.fn().mockReturnValue({ ...mockTask, name: 'Updated Task' }),
    remove: jest.fn().mockReturnValue(mockTask),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskResolver, { provide: TaskService, useValue: mockService }],
    }).compile();

    resolver = module.get<TaskResolver>(TaskResolver);
    service = module.get<TaskService>(TaskService);
  });

  it('should create a task', () => {
    const input: CreateTaskInput = {
      name: 'New Task',
      desc: 'A new task',
      step: 0,
    };

    const result = resolver.createTask(input);
    expect(result).toEqual(mockTask);
    expect(service.create).toHaveBeenCalledWith(input);
  });

  it('should return all tasks', async () => {
    const result = await resolver.getTasks();
    expect(result).toEqual([mockTask]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a task by id', () => {
    const result = resolver.getTask(1);
    expect(result).toEqual(mockTask);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if task not found', () => {
    jest.spyOn(service, 'findOne').mockReturnValueOnce(undefined);

    expect(() => resolver.getTask(99)).toThrow(NotFoundException);
  });

  it('should return tasks by step', () => {
    const result = resolver.getTasksByStep(0);
    expect(result).toEqual([mockTask]);
    expect(service.findTasksByStep).toHaveBeenCalledWith(0);
  });

  it('should update a task', () => {
    const input: UpdateTaskInput = {
      id: 1,
      name: 'Updated Task',
      desc: 'Updated desc',
      step: 1,
    };

    const result = resolver.updateTask(input);
    expect(result).toEqual({ ...mockTask, name: 'Updated Task' });
    expect(service.update).toHaveBeenCalledWith(input.id, input);
  });

  it('should remove a task', () => {
    const result = resolver.removeTask(1);
    expect(result).toEqual(mockTask);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});

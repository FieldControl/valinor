import { TaskService } from './task.service';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    service = new TaskService();
  });

  it('should create a task', () => {
    const input: CreateTaskInput = { name: 'Test', desc: 'Testing', step: 0 };
    const task = service.create(input);

    expect(task).toEqual({ id: 1, ...input });
  });

  it('should find all tasks', () => {
    service.create({ name: 'One', desc: 'Desc', step: 0 });
    service.create({ name: 'Two', desc: 'More', step: 1 });

    const tasks = service.findAll();
    expect(tasks.length).toBe(2);
  });

  it('should find one task', () => {
    const task = service.create({ name: 'FindMe', desc: '', step: 0 });
    const found = service.findOne(task.id);
    expect(found).toEqual(task);
  });

  it('should update a task', () => {
    const task = service.create({ name: 'Old', desc: 'Old desc', step: 0 });

    const update: UpdateTaskInput = { id: task.id, name: 'New', desc: 'New desc', step: 1 };
    const updated = service.update(task.id, update);
    expect(updated).toEqual(update);
  });

  it('should remove a task', () => {
    const task = service.create({ name: 'ToRemove', desc: '', step: 2 });
    const removed = service.remove(task.id);

    expect(removed?.id).toBe(task.id);
    expect(service.findOne(task.id)).toBeUndefined();
  });
});

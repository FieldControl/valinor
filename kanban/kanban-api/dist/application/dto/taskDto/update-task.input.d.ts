import { CreateTaskInput } from './create-task.input';
declare const UpdateTaskInput_base: import("@nestjs/common").Type<Partial<CreateTaskInput>>;
export declare class UpdateTaskInput extends UpdateTaskInput_base {
    id: string;
}
export declare class UpdateTasksInput {
    tasks: UpdateTaskInput[];
}
export {};

declare class TaskInput {
    description: string;
}
export declare class CreateCardDto {
    title: string;
    memberId: number;
    tasks: TaskInput[];
}
export {};

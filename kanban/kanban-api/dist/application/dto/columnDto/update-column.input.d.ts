import { CreateColumnInput } from './create-column.input';
declare const UpdateColumnInput_base: import("@nestjs/common").Type<Partial<CreateColumnInput>>;
export declare class UpdateColumnInput extends UpdateColumnInput_base {
    id: string;
}
export declare class UpdateColumnsInput {
    columns: UpdateColumnInput[];
}
export {};

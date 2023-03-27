import { DocumentNode, FieldNode } from 'graphql';
import { Reference, StoreObject, StoreValue, isReference } from '../../../utilities';
import { StorageType } from '../../inmemory/policies';
export type SafeReadonly<T> = T extends object ? Readonly<T> : T;
export type MissingTree = string | {
    readonly [key: string]: MissingTree;
};
export declare class MissingFieldError extends Error {
    readonly message: string;
    readonly path: MissingTree | Array<string | number>;
    readonly query: DocumentNode;
    readonly variables?: Record<string, any> | undefined;
    constructor(message: string, path: MissingTree | Array<string | number>, query: DocumentNode, variables?: Record<string, any> | undefined);
    readonly missing: MissingTree;
}
export interface FieldSpecifier {
    typename?: string;
    fieldName: string;
    field?: FieldNode;
    args?: Record<string, any>;
    variables?: Record<string, any>;
}
export interface ReadFieldOptions extends FieldSpecifier {
    from?: StoreObject | Reference;
}
export interface ReadFieldFunction {
    <V = StoreValue>(options: ReadFieldOptions): SafeReadonly<V> | undefined;
    <V = StoreValue>(fieldName: string, from?: StoreObject | Reference): SafeReadonly<V> | undefined;
}
export type ToReferenceFunction = (objOrIdOrRef: StoreObject | string | Reference, mergeIntoStore?: boolean) => Reference | undefined;
export type CanReadFunction = (value: StoreValue) => boolean;
export type ModifierDetails = {
    DELETE: any;
    INVALIDATE: any;
    fieldName: string;
    storeFieldName: string;
    readField: ReadFieldFunction;
    canRead: CanReadFunction;
    isReference: typeof isReference;
    toReference: ToReferenceFunction;
    storage: StorageType;
};
export type Modifier<T> = (value: T, details: ModifierDetails) => T;
export type Modifiers = {
    [fieldName: string]: Modifier<any>;
};
//# sourceMappingURL=common.d.ts.map
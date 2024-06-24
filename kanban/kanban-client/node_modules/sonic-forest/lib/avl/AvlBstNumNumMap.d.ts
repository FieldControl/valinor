import type { Printable } from '../print/types';
import type { AvlNodeReference, IAvlTreeNode } from './types';
export declare class NumNumItem implements IAvlTreeNode<number, number> {
    readonly k: number;
    v: number;
    p: NumNumItem | undefined;
    l: NumNumItem | undefined;
    r: NumNumItem | undefined;
    bf: number;
    constructor(k: number, v: number);
}
export declare class AvlBstNumNumMap implements Printable {
    root: NumNumItem | undefined;
    insert(k: number, v: number): AvlNodeReference<NumNumItem>;
    set(k: number, v: number): AvlNodeReference<NumNumItem>;
    find(k: number): AvlNodeReference<NumNumItem> | undefined;
    get(k: number): number | undefined;
    has(k: number): boolean;
    getOrNextLower(k: number): NumNumItem | undefined;
    forEach(fn: (node: NumNumItem) => void): void;
    toString(tab: string): string;
}

import type { Printable } from '../print/types';
import type { Comparator, HeadlessNode } from '../types';
import type { AvlNodeReference, IAvlTreeNode } from './types';
export declare class AvlSetNode<V> implements IAvlTreeNode<V, void> {
    readonly k: V;
    p: AvlSetNode<V> | undefined;
    l: AvlSetNode<V> | undefined;
    r: AvlSetNode<V> | undefined;
    bf: number;
    v: undefined;
    constructor(k: V);
}
export declare class AvlSet<V> implements Printable {
    root: AvlSetNode<V> | undefined;
    readonly comparator: Comparator<V>;
    constructor(comparator?: Comparator<V>);
    private insert;
    add(value: V): AvlNodeReference<AvlSetNode<V>>;
    private find;
    del(k: V): void;
    clear(): void;
    has(k: V): boolean;
    size(): number;
    isEmpty(): boolean;
    getOrNextLower(k: V): AvlSetNode<V> | undefined;
    forEach(fn: (node: AvlSetNode<V>) => void): void;
    first(): AvlSetNode<V> | undefined;
    readonly next: <N extends HeadlessNode>(curr: N) => N | undefined;
    iterator0(): () => undefined | AvlSetNode<V>;
    iterator(): Iterator<AvlSetNode<V>>;
    entries(): IterableIterator<AvlSetNode<V>>;
    toString(tab: string): string;
}

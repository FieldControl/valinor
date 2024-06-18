import type { Printable } from '../print/types';
import type { Comparator, HeadlessNode } from '../types';
import type { AvlNodeReference, IAvlTreeNode } from './types';
export declare class AvlNode<K, V> implements IAvlTreeNode<K, V> {
    readonly k: K;
    v: V;
    p: AvlNode<K, V> | undefined;
    l: AvlNode<K, V> | undefined;
    r: AvlNode<K, V> | undefined;
    bf: number;
    constructor(k: K, v: V);
}
export declare class AvlMap<K, V> implements Printable {
    root: AvlNode<K, V> | undefined;
    readonly comparator: Comparator<K>;
    constructor(comparator?: Comparator<K>);
    insert(k: K, v: V): AvlNodeReference<AvlNode<K, V>>;
    set(k: K, v: V): AvlNodeReference<AvlNode<K, V>>;
    find(k: K): AvlNodeReference<AvlNode<K, V>> | undefined;
    get(k: K): V | undefined;
    del(k: K): boolean;
    clear(): void;
    has(k: K): boolean;
    _size: number;
    size(): number;
    isEmpty(): boolean;
    getOrNextLower(k: K): AvlNode<K, V> | undefined;
    forEach(fn: (node: AvlNode<K, V>) => void): void;
    first(): AvlNode<K, V> | undefined;
    readonly next: <N extends HeadlessNode>(curr: N) => N | undefined;
    iterator0(): () => undefined | AvlNode<K, V>;
    iterator(): Iterator<AvlNode<K, V>>;
    entries(): IterableIterator<AvlNode<K, V>>;
    toString(tab: string): string;
}

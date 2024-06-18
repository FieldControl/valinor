import type { Comparator } from '../types';
import type { IRbTreeNode } from './types';
import type { AvlNodeReference } from '../avl/types';
import type { Printable } from '../print/types';
export declare class RbNode<K, V> implements IRbTreeNode<K, V> {
    readonly k: K;
    v: V;
    p: RbNode<K, V> | undefined;
    l: RbNode<K, V> | undefined;
    r: RbNode<K, V> | undefined;
    b: boolean;
    constructor(k: K, v: V);
}
export declare class RbMap<K, V> implements Printable {
    root: RbNode<K, V> | undefined;
    readonly comparator: Comparator<K>;
    constructor(comparator?: Comparator<K>);
    insert(k: K, v: V): AvlNodeReference<RbNode<K, V>>;
    set(k: K, v: V): AvlNodeReference<RbNode<K, V>>;
    find(k: K): AvlNodeReference<RbNode<K, V>> | undefined;
    get(k: K): V | undefined;
    has(k: K): boolean;
    getOrNextLower(k: K): RbNode<K, V> | undefined;
    forEach(fn: (node: RbNode<K, V>) => void): void;
    toString(tab: string): string;
}

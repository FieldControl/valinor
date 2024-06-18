import type { Comparator, ITreeNode } from './types';
export declare class Tree<K = unknown, V = unknown> {
    readonly comparator: Comparator<K>;
    root: ITreeNode<K, V> | undefined;
    size: number;
    constructor(comparator?: Comparator<K>);
    set(key: K, value: V): void;
    setFast(key: K, value: V): void;
    get(key: K): V | undefined;
    getOrNextLower(key: K): V | undefined;
    has(key: K): boolean;
    delete(key: K): V | undefined;
    max(): V | undefined;
    iterator(): () => V | undefined;
    toString(tab?: string): string;
    protected toStringNode(node: ITreeNode<K, V>, tab: string, side: 'l' | 'r' | ''): string;
}

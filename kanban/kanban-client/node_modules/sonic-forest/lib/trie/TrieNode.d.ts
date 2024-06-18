import type { Printable } from '../print/types';
import type { ITreeNode } from '../types';
export declare class TrieNode<V = unknown> implements ITreeNode<string, unknown>, Printable {
    k: string;
    v: V;
    p: TrieNode<V> | undefined;
    l: TrieNode<V> | undefined;
    r: TrieNode<V> | undefined;
    children: TrieNode<V> | undefined;
    constructor(k: string, v: V);
    forChildren(callback: (child: TrieNode<V>, index: number) => void): void;
    toRecord(prefix?: string, record?: Record<string, unknown>): Record<string, unknown>;
    toString(tab?: string): string;
}

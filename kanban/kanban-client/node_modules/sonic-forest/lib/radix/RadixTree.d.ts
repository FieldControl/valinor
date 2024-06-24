import { Printable } from '../print/types';
import { TrieNode } from '../trie/TrieNode';
export declare class RadixTree<V = unknown> extends TrieNode<V> implements Printable {
    size: number;
    constructor();
    set(key: string, value: V): void;
    get(key: string): V | undefined;
    delete(key: string): boolean;
}

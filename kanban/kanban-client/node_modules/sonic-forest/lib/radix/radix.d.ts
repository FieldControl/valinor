import { TrieNode } from '../trie/TrieNode';
export declare const insert: (root: TrieNode, path: string, value: unknown) => number;
export declare const find: (node: TrieNode, key: string) => undefined | TrieNode;
export declare const findWithParents: (node: TrieNode, key: string) => undefined | TrieNode[];
export declare const remove: (root: TrieNode, key: string) => boolean;
export declare const toRecord: (node: TrieNode | undefined, prefix?: string, record?: Record<string, unknown>) => Record<string, unknown>;
export declare const print: (node: TrieNode, tab?: string) => string;

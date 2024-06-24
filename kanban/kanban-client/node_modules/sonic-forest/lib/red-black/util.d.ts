import type { Comparator } from '../types';
import type { IRbTreeNode, RbHeadlessNode } from './types';
export declare const insert: <K, N extends IRbTreeNode<K, unknown>>(root: N | undefined, n: N, comparator: Comparator<K>) => N;
export declare const insertRight: (root: RbHeadlessNode, n: RbHeadlessNode, p: RbHeadlessNode) => RbHeadlessNode;
export declare const insertLeft: (root: RbHeadlessNode, n: RbHeadlessNode, p: RbHeadlessNode) => RbHeadlessNode;
export declare const remove: <K, N extends IRbTreeNode<K, unknown>>(root: N | undefined, n: N) => N | undefined;
export declare const print: (node: undefined | RbHeadlessNode | IRbTreeNode, tab?: string) => string;

import type { Comparator } from '../types';
import type { AvlHeadlessNode, IAvlTreeNode } from './types';
export declare const insertRight: (root: AvlHeadlessNode, n: AvlHeadlessNode, p: AvlHeadlessNode) => AvlHeadlessNode;
export declare const insertLeft: (root: AvlHeadlessNode, n: AvlHeadlessNode, p: AvlHeadlessNode) => AvlHeadlessNode;
export declare const insert: <K, N extends IAvlTreeNode<K, unknown>>(root: N | undefined, node: N, comparator: Comparator<K>) => N;
export declare const remove: <K, N extends IAvlTreeNode<K, unknown>>(root: N | undefined, n: N) => N | undefined;
export declare const print: (node: undefined | AvlHeadlessNode | IAvlTreeNode, tab?: string) => string;

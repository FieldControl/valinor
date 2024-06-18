import type { ITreeNode } from '../types';
export interface IAvlTreeNode<K = unknown, V = unknown> {
    p: IAvlTreeNode<K, V> | undefined;
    l: IAvlTreeNode<K, V> | undefined;
    r: IAvlTreeNode<K, V> | undefined;
    k: K;
    v: V;
    bf: number;
}
export interface AvlHeadlessNode {
    p: AvlHeadlessNode | undefined;
    l: AvlHeadlessNode | undefined;
    r: AvlHeadlessNode | undefined;
    bf: number;
}
export interface AvlNodeReference<N extends Pick<ITreeNode, 'k' | 'v'>> {
    readonly k: N['k'];
    v: N['v'];
}

import { ITreeNode } from './types';
export declare class TreeNode<K = unknown, V = unknown> implements ITreeNode<K, V> {
    k: K;
    v: V;
    p: ITreeNode<K, V> | undefined;
    l: ITreeNode<K, V> | undefined;
    r: ITreeNode<K, V> | undefined;
    constructor(k: K, v: V);
}

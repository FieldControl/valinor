export interface ITreeNode<K = unknown, V = unknown> {
    p: ITreeNode<K, V> | undefined;
    l: ITreeNode<K, V> | undefined;
    r: ITreeNode<K, V> | undefined;
    k: K;
    v: V;
}
export interface HeadlessNode {
    p: HeadlessNode | undefined;
    l: HeadlessNode | undefined;
    r: HeadlessNode | undefined;
}
export type Comparator<T> = (a: T, b: T) => number;

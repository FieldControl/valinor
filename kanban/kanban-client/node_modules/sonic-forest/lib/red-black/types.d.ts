export interface IRbTreeNode<K = unknown, V = unknown> {
    p: IRbTreeNode<K, V> | undefined;
    l: IRbTreeNode<K, V> | undefined;
    r: IRbTreeNode<K, V> | undefined;
    k: K;
    v: V;
    b: boolean;
}
export interface RbHeadlessNode {
    p: RbHeadlessNode | undefined;
    l: RbHeadlessNode | undefined;
    r: RbHeadlessNode | undefined;
    b: boolean;
}
export interface RbNodeReference<N extends IRbTreeNode> {
    readonly k: N['k'];
    v: N['v'];
}

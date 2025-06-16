export declare class TreeNode<T> {
    readonly value: T;
    readonly children: Set<TreeNode<T>>;
    private parent;
    constructor({ value, parent }: {
        value: T;
        parent: TreeNode<T> | null;
    });
    addChild(child: TreeNode<T>): void;
    removeChild(child: TreeNode<T>): void;
    relink(parent: TreeNode<T>): void;
    getDepth(): number;
    hasCycleWith(target: T): boolean;
}

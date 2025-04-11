import { Module } from '../module';
export declare class TopologyTree {
    private root;
    private links;
    constructor(moduleRef: Module);
    walk(callback: (value: Module, depth: number) => void): void;
    private traverseAndMapToTree;
}

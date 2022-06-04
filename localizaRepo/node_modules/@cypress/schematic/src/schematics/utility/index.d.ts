import { Tree } from '@angular-devkit/schematics';
export interface NodePackage {
    name: string;
    version: string;
}
export declare function getAngularVersion(tree: Tree): number;
/**
   * Attempt to retrieve the latest package version from NPM
   * Return an optional "latest" version in case of error
   * @param packageName
   */
export declare function getLatestNodeVersion(packageName: string): Promise<NodePackage>;

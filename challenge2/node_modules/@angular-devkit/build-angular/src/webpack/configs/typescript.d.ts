/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AngularWebpackPlugin } from '@ngtools/webpack';
import { WebpackConfigOptions } from '../../utils/build-options';
export declare function getTypeScriptConfig(wco: WebpackConfigOptions): {
    module: {
        rules: {
            test: RegExp;
            loader: string;
        }[];
    };
    plugins: AngularWebpackPlugin[];
};
export declare function getTypescriptWorkerPlugin(wco: WebpackConfigOptions, workerTsConfigPath: string): AngularWebpackPlugin;

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ArchitectCommand } from '../models/architect-command';
import { Arguments } from '../models/interface';
import { Schema as LintCommandSchema } from './lint';
export declare class LintCommand extends ArchitectCommand<LintCommandSchema> {
    readonly target = "lint";
    readonly multiTarget = true;
    readonly missingTargetError = "\nCannot find \"lint\" target for the specified project.\n\nYou should add a package that implements linting capabilities.\n\nFor example:\n  ng add @angular-eslint/schematics\n";
    initialize(options: LintCommandSchema & Arguments): Promise<number | void>;
}

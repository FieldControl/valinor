/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export declare type DiagnosticReporter = (type: 'error' | 'warning' | 'info', message: string) => void;
export interface ApplicationPresetOptions {
    i18n?: {
        locale: string;
        missingTranslationBehavior?: 'error' | 'warning' | 'ignore';
        translation?: unknown;
    };
    angularLinker?: {
        shouldLink: boolean;
        jitMode: boolean;
    };
    forceES5?: boolean;
    forceAsyncTransformation?: boolean;
    diagnosticReporter?: DiagnosticReporter;
}
export default function (api: unknown, options: ApplicationPresetOptions): {
    presets: any[][];
    plugins: any[];
};

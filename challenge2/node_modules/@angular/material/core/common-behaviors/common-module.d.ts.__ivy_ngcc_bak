/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HighContrastModeDetector } from '@angular/cdk/a11y';
import { InjectionToken } from '@angular/core';
/** @docs-private */
export declare function MATERIAL_SANITY_CHECKS_FACTORY(): SanityChecks;
/** Injection token that configures whether the Material sanity checks are enabled. */
export declare const MATERIAL_SANITY_CHECKS: InjectionToken<SanityChecks>;
/**
 * Possible sanity checks that can be enabled. If set to
 * true/false, all checks will be enabled/disabled.
 */
export declare type SanityChecks = boolean | GranularSanityChecks;
/** Object that can be used to configure the sanity checks granularly. */
export interface GranularSanityChecks {
    doctype: boolean;
    theme: boolean;
    version: boolean;
}
/**
 * Module that captures anything that should be loaded and/or run for *all* Angular Material
 * components. This includes Bidi, etc.
 *
 * This module should be imported to each top-level component module (e.g., MatTabsModule).
 */
export declare class MatCommonModule {
    /** Whether we've done the global sanity checks (e.g. a theme is loaded, there is a doctype). */
    private _hasDoneGlobalChecks;
    /** Configured sanity checks. */
    private _sanityChecks;
    /** Used to reference correct document/window */
    protected _document: Document;
    constructor(highContrastModeDetector: HighContrastModeDetector, sanityChecks: any, document: any);
    /** Use defaultView of injected document if available or fallback to global window reference */
    private _getWindow;
    /** Whether any sanity checks are enabled. */
    private _checksAreEnabled;
    /** Whether the code is running in tests. */
    private _isTestEnv;
    private _checkDoctypeIsDefined;
    private _checkThemeIsPresent;
    /** Checks whether the material version matches the cdk version */
    private _checkCdkVersionMatch;
}

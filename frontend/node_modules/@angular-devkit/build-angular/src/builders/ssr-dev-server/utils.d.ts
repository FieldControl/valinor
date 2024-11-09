/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="@types/node/child_process" />
/// <reference types="@types/node/ts4.8/child_process" />
import { SpawnOptions } from 'child_process';
import { Observable } from 'rxjs';
export declare function getAvailablePort(): Promise<number>;
export declare function spawnAsObservable(command: string, args?: string[], options?: SpawnOptions): Observable<{
    stdout?: string;
    stderr?: string;
}>;
export declare function waitUntilServerIsListening(port: number, host?: string): Observable<undefined>;

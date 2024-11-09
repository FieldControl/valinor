/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ImportedSymbolsTracker } from '../../../imports';
import { InputMapping } from '../../../metadata';
import { ClassMember, ReflectionHost } from '../../../reflection';
/**
 * Attempts to parse a signal input class member. Returns the parsed
 * input mapping if possible.
 */
export declare function tryParseSignalInputMapping(member: Pick<ClassMember, 'name' | 'value' | 'accessLevel'>, reflector: ReflectionHost, importTracker: ImportedSymbolsTracker): InputMapping | null;

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/core/schematics/migrations/activated-route-snapshot-fragment/util" />
import * as ts from 'typescript';
/**
 * Finds all the accesses of `ActivatedRouteSnapshot.fragment`
 * that need to be migrated within a particular file.
 */
export declare function findFragmentAccesses(typeChecker: ts.TypeChecker, sourceFile: ts.SourceFile): Set<ts.PropertyAccessExpression>;
/** Migrates an `ActivatedRouteSnapshot.fragment` access. */
export declare function migrateActivatedRouteSnapshotFragment(node: ts.PropertyAccessExpression): ts.Node;

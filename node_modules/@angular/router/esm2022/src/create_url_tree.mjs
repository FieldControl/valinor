/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ɵRuntimeError as RuntimeError } from '@angular/core';
import { PRIMARY_OUTLET } from './shared';
import { createRoot, squashSegmentGroup, UrlSegment, UrlSegmentGroup, UrlTree } from './url_tree';
import { last, shallowEqual } from './utils/collection';
/**
 * Creates a `UrlTree` relative to an `ActivatedRouteSnapshot`.
 *
 * @publicApi
 *
 *
 * @param relativeTo The `ActivatedRouteSnapshot` to apply the commands to
 * @param commands An array of URL fragments with which to construct the new URL tree.
 * If the path is static, can be the literal URL string. For a dynamic path, pass an array of path
 * segments, followed by the parameters for each segment.
 * The fragments are applied to the one provided in the `relativeTo` parameter.
 * @param queryParams The query parameters for the `UrlTree`. `null` if the `UrlTree` does not have
 *     any query parameters.
 * @param fragment The fragment for the `UrlTree`. `null` if the `UrlTree` does not have a fragment.
 *
 * @usageNotes
 *
 * ```
 * // create /team/33/user/11
 * createUrlTreeFromSnapshot(snapshot, ['/team', 33, 'user', 11]);
 *
 * // create /team/33;expand=true/user/11
 * createUrlTreeFromSnapshot(snapshot, ['/team', 33, {expand: true}, 'user', 11]);
 *
 * // you can collapse static segments like this (this works only with the first passed-in value):
 * createUrlTreeFromSnapshot(snapshot, ['/team/33/user', userId]);
 *
 * // If the first segment can contain slashes, and you do not want the router to split it,
 * // you can do the following:
 * createUrlTreeFromSnapshot(snapshot, [{segmentPath: '/one/two'}]);
 *
 * // create /team/33/(user/11//right:chat)
 * createUrlTreeFromSnapshot(snapshot, ['/team', 33, {outlets: {primary: 'user/11', right:
 * 'chat'}}], null, null);
 *
 * // remove the right secondary node
 * createUrlTreeFromSnapshot(snapshot, ['/team', 33, {outlets: {primary: 'user/11', right: null}}]);
 *
 * // For the examples below, assume the current URL is for the `/team/33/user/11` and the
 * `ActivatedRouteSnapshot` points to `user/11`:
 *
 * // navigate to /team/33/user/11/details
 * createUrlTreeFromSnapshot(snapshot, ['details']);
 *
 * // navigate to /team/33/user/22
 * createUrlTreeFromSnapshot(snapshot, ['../22']);
 *
 * // navigate to /team/44/user/22
 * createUrlTreeFromSnapshot(snapshot, ['../../team/44/user/22']);
 * ```
 */
export function createUrlTreeFromSnapshot(relativeTo, commands, queryParams = null, fragment = null) {
    const relativeToUrlSegmentGroup = createSegmentGroupFromRoute(relativeTo);
    return createUrlTreeFromSegmentGroup(relativeToUrlSegmentGroup, commands, queryParams, fragment);
}
export function createSegmentGroupFromRoute(route) {
    let targetGroup;
    function createSegmentGroupFromRouteRecursive(currentRoute) {
        const childOutlets = {};
        for (const childSnapshot of currentRoute.children) {
            const root = createSegmentGroupFromRouteRecursive(childSnapshot);
            childOutlets[childSnapshot.outlet] = root;
        }
        const segmentGroup = new UrlSegmentGroup(currentRoute.url, childOutlets);
        if (currentRoute === route) {
            targetGroup = segmentGroup;
        }
        return segmentGroup;
    }
    const rootCandidate = createSegmentGroupFromRouteRecursive(route.root);
    const rootSegmentGroup = createRoot(rootCandidate);
    return targetGroup ?? rootSegmentGroup;
}
export function createUrlTreeFromSegmentGroup(relativeTo, commands, queryParams, fragment) {
    let root = relativeTo;
    while (root.parent) {
        root = root.parent;
    }
    // There are no commands so the `UrlTree` goes to the same path as the one created from the
    // `UrlSegmentGroup`. All we need to do is update the `queryParams` and `fragment` without
    // applying any other logic.
    if (commands.length === 0) {
        return tree(root, root, root, queryParams, fragment);
    }
    const nav = computeNavigation(commands);
    if (nav.toRoot()) {
        return tree(root, root, new UrlSegmentGroup([], {}), queryParams, fragment);
    }
    const position = findStartingPositionForTargetGroup(nav, root, relativeTo);
    const newSegmentGroup = position.processChildren
        ? updateSegmentGroupChildren(position.segmentGroup, position.index, nav.commands)
        : updateSegmentGroup(position.segmentGroup, position.index, nav.commands);
    return tree(root, position.segmentGroup, newSegmentGroup, queryParams, fragment);
}
function isMatrixParams(command) {
    return typeof command === 'object' && command != null && !command.outlets && !command.segmentPath;
}
/**
 * Determines if a given command has an `outlets` map. When we encounter a command
 * with an outlets k/v map, we need to apply each outlet individually to the existing segment.
 */
function isCommandWithOutlets(command) {
    return typeof command === 'object' && command != null && command.outlets;
}
function tree(oldRoot, oldSegmentGroup, newSegmentGroup, queryParams, fragment) {
    let qp = {};
    if (queryParams) {
        Object.entries(queryParams).forEach(([name, value]) => {
            qp[name] = Array.isArray(value) ? value.map((v) => `${v}`) : `${value}`;
        });
    }
    let rootCandidate;
    if (oldRoot === oldSegmentGroup) {
        rootCandidate = newSegmentGroup;
    }
    else {
        rootCandidate = replaceSegment(oldRoot, oldSegmentGroup, newSegmentGroup);
    }
    const newRoot = createRoot(squashSegmentGroup(rootCandidate));
    return new UrlTree(newRoot, qp, fragment);
}
/**
 * Replaces the `oldSegment` which is located in some child of the `current` with the `newSegment`.
 * This also has the effect of creating new `UrlSegmentGroup` copies to update references. This
 * shouldn't be necessary but the fallback logic for an invalid ActivatedRoute in the creation uses
 * the Router's current url tree. If we don't create new segment groups, we end up modifying that
 * value.
 */
function replaceSegment(current, oldSegment, newSegment) {
    const children = {};
    Object.entries(current.children).forEach(([outletName, c]) => {
        if (c === oldSegment) {
            children[outletName] = newSegment;
        }
        else {
            children[outletName] = replaceSegment(c, oldSegment, newSegment);
        }
    });
    return new UrlSegmentGroup(current.segments, children);
}
class Navigation {
    constructor(isAbsolute, numberOfDoubleDots, commands) {
        this.isAbsolute = isAbsolute;
        this.numberOfDoubleDots = numberOfDoubleDots;
        this.commands = commands;
        if (isAbsolute && commands.length > 0 && isMatrixParams(commands[0])) {
            throw new RuntimeError(4003 /* RuntimeErrorCode.ROOT_SEGMENT_MATRIX_PARAMS */, (typeof ngDevMode === 'undefined' || ngDevMode) &&
                'Root segment cannot have matrix parameters');
        }
        const cmdWithOutlet = commands.find(isCommandWithOutlets);
        if (cmdWithOutlet && cmdWithOutlet !== last(commands)) {
            throw new RuntimeError(4004 /* RuntimeErrorCode.MISPLACED_OUTLETS_COMMAND */, (typeof ngDevMode === 'undefined' || ngDevMode) &&
                '{outlets:{}} has to be the last command');
        }
    }
    toRoot() {
        return this.isAbsolute && this.commands.length === 1 && this.commands[0] == '/';
    }
}
/** Transforms commands to a normalized `Navigation` */
function computeNavigation(commands) {
    if (typeof commands[0] === 'string' && commands.length === 1 && commands[0] === '/') {
        return new Navigation(true, 0, commands);
    }
    let numberOfDoubleDots = 0;
    let isAbsolute = false;
    const res = commands.reduce((res, cmd, cmdIdx) => {
        if (typeof cmd === 'object' && cmd != null) {
            if (cmd.outlets) {
                const outlets = {};
                Object.entries(cmd.outlets).forEach(([name, commands]) => {
                    outlets[name] = typeof commands === 'string' ? commands.split('/') : commands;
                });
                return [...res, { outlets }];
            }
            if (cmd.segmentPath) {
                return [...res, cmd.segmentPath];
            }
        }
        if (!(typeof cmd === 'string')) {
            return [...res, cmd];
        }
        if (cmdIdx === 0) {
            cmd.split('/').forEach((urlPart, partIndex) => {
                if (partIndex == 0 && urlPart === '.') {
                    // skip './a'
                }
                else if (partIndex == 0 && urlPart === '') {
                    //  '/a'
                    isAbsolute = true;
                }
                else if (urlPart === '..') {
                    //  '../a'
                    numberOfDoubleDots++;
                }
                else if (urlPart != '') {
                    res.push(urlPart);
                }
            });
            return res;
        }
        return [...res, cmd];
    }, []);
    return new Navigation(isAbsolute, numberOfDoubleDots, res);
}
class Position {
    constructor(segmentGroup, processChildren, index) {
        this.segmentGroup = segmentGroup;
        this.processChildren = processChildren;
        this.index = index;
    }
}
function findStartingPositionForTargetGroup(nav, root, target) {
    if (nav.isAbsolute) {
        return new Position(root, true, 0);
    }
    if (!target) {
        // `NaN` is used only to maintain backwards compatibility with incorrectly mocked
        // `ActivatedRouteSnapshot` in tests. In prior versions of this code, the position here was
        // determined based on an internal property that was rarely mocked, resulting in `NaN`. In
        // reality, this code path should _never_ be touched since `target` is not allowed to be falsey.
        return new Position(root, false, NaN);
    }
    if (target.parent === null) {
        return new Position(target, true, 0);
    }
    const modifier = isMatrixParams(nav.commands[0]) ? 0 : 1;
    const index = target.segments.length - 1 + modifier;
    return createPositionApplyingDoubleDots(target, index, nav.numberOfDoubleDots);
}
function createPositionApplyingDoubleDots(group, index, numberOfDoubleDots) {
    let g = group;
    let ci = index;
    let dd = numberOfDoubleDots;
    while (dd > ci) {
        dd -= ci;
        g = g.parent;
        if (!g) {
            throw new RuntimeError(4005 /* RuntimeErrorCode.INVALID_DOUBLE_DOTS */, (typeof ngDevMode === 'undefined' || ngDevMode) && "Invalid number of '../'");
        }
        ci = g.segments.length;
    }
    return new Position(g, false, ci - dd);
}
function getOutlets(commands) {
    if (isCommandWithOutlets(commands[0])) {
        return commands[0].outlets;
    }
    return { [PRIMARY_OUTLET]: commands };
}
function updateSegmentGroup(segmentGroup, startIndex, commands) {
    segmentGroup ??= new UrlSegmentGroup([], {});
    if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
        return updateSegmentGroupChildren(segmentGroup, startIndex, commands);
    }
    const m = prefixedWith(segmentGroup, startIndex, commands);
    const slicedCommands = commands.slice(m.commandIndex);
    if (m.match && m.pathIndex < segmentGroup.segments.length) {
        const g = new UrlSegmentGroup(segmentGroup.segments.slice(0, m.pathIndex), {});
        g.children[PRIMARY_OUTLET] = new UrlSegmentGroup(segmentGroup.segments.slice(m.pathIndex), segmentGroup.children);
        return updateSegmentGroupChildren(g, 0, slicedCommands);
    }
    else if (m.match && slicedCommands.length === 0) {
        return new UrlSegmentGroup(segmentGroup.segments, {});
    }
    else if (m.match && !segmentGroup.hasChildren()) {
        return createNewSegmentGroup(segmentGroup, startIndex, commands);
    }
    else if (m.match) {
        return updateSegmentGroupChildren(segmentGroup, 0, slicedCommands);
    }
    else {
        return createNewSegmentGroup(segmentGroup, startIndex, commands);
    }
}
function updateSegmentGroupChildren(segmentGroup, startIndex, commands) {
    if (commands.length === 0) {
        return new UrlSegmentGroup(segmentGroup.segments, {});
    }
    else {
        const outlets = getOutlets(commands);
        const children = {};
        // If the set of commands applies to anything other than the primary outlet and the child
        // segment is an empty path primary segment on its own, we want to apply the commands to the
        // empty child path rather than here. The outcome is that the empty primary child is effectively
        // removed from the final output UrlTree. Imagine the following config:
        //
        // {path: '', children: [{path: '**', outlet: 'popup'}]}.
        //
        // Navigation to /(popup:a) will activate the child outlet correctly Given a follow-up
        // navigation with commands
        // ['/', {outlets: {'popup': 'b'}}], we _would not_ want to apply the outlet commands to the
        // root segment because that would result in
        // //(popup:a)(popup:b) since the outlet command got applied one level above where it appears in
        // the `ActivatedRoute` rather than updating the existing one.
        //
        // Because empty paths do not appear in the URL segments and the fact that the segments used in
        // the output `UrlTree` are squashed to eliminate these empty paths where possible
        // https://github.com/angular/angular/blob/13f10de40e25c6900ca55bd83b36bd533dacfa9e/packages/router/src/url_tree.ts#L755
        // it can be hard to determine what is the right thing to do when applying commands to a
        // `UrlSegmentGroup` that is created from an "unsquashed"/expanded `ActivatedRoute` tree.
        // This code effectively "squashes" empty path primary routes when they have no siblings on
        // the same level of the tree.
        if (Object.keys(outlets).some((o) => o !== PRIMARY_OUTLET) &&
            segmentGroup.children[PRIMARY_OUTLET] &&
            segmentGroup.numberOfChildren === 1 &&
            segmentGroup.children[PRIMARY_OUTLET].segments.length === 0) {
            const childrenOfEmptyChild = updateSegmentGroupChildren(segmentGroup.children[PRIMARY_OUTLET], startIndex, commands);
            return new UrlSegmentGroup(segmentGroup.segments, childrenOfEmptyChild.children);
        }
        Object.entries(outlets).forEach(([outlet, commands]) => {
            if (typeof commands === 'string') {
                commands = [commands];
            }
            if (commands !== null) {
                children[outlet] = updateSegmentGroup(segmentGroup.children[outlet], startIndex, commands);
            }
        });
        Object.entries(segmentGroup.children).forEach(([childOutlet, child]) => {
            if (outlets[childOutlet] === undefined) {
                children[childOutlet] = child;
            }
        });
        return new UrlSegmentGroup(segmentGroup.segments, children);
    }
}
function prefixedWith(segmentGroup, startIndex, commands) {
    let currentCommandIndex = 0;
    let currentPathIndex = startIndex;
    const noMatch = { match: false, pathIndex: 0, commandIndex: 0 };
    while (currentPathIndex < segmentGroup.segments.length) {
        if (currentCommandIndex >= commands.length)
            return noMatch;
        const path = segmentGroup.segments[currentPathIndex];
        const command = commands[currentCommandIndex];
        // Do not try to consume command as part of the prefixing if it has outlets because it can
        // contain outlets other than the one being processed. Consuming the outlets command would
        // result in other outlets being ignored.
        if (isCommandWithOutlets(command)) {
            break;
        }
        const curr = `${command}`;
        const next = currentCommandIndex < commands.length - 1 ? commands[currentCommandIndex + 1] : null;
        if (currentPathIndex > 0 && curr === undefined)
            break;
        if (curr && next && typeof next === 'object' && next.outlets === undefined) {
            if (!compare(curr, next, path))
                return noMatch;
            currentCommandIndex += 2;
        }
        else {
            if (!compare(curr, {}, path))
                return noMatch;
            currentCommandIndex++;
        }
        currentPathIndex++;
    }
    return { match: true, pathIndex: currentPathIndex, commandIndex: currentCommandIndex };
}
function createNewSegmentGroup(segmentGroup, startIndex, commands) {
    const paths = segmentGroup.segments.slice(0, startIndex);
    let i = 0;
    while (i < commands.length) {
        const command = commands[i];
        if (isCommandWithOutlets(command)) {
            const children = createNewSegmentChildren(command.outlets);
            return new UrlSegmentGroup(paths, children);
        }
        // if we start with an object literal, we need to reuse the path part from the segment
        if (i === 0 && isMatrixParams(commands[0])) {
            const p = segmentGroup.segments[startIndex];
            paths.push(new UrlSegment(p.path, stringify(commands[0])));
            i++;
            continue;
        }
        const curr = isCommandWithOutlets(command) ? command.outlets[PRIMARY_OUTLET] : `${command}`;
        const next = i < commands.length - 1 ? commands[i + 1] : null;
        if (curr && next && isMatrixParams(next)) {
            paths.push(new UrlSegment(curr, stringify(next)));
            i += 2;
        }
        else {
            paths.push(new UrlSegment(curr, {}));
            i++;
        }
    }
    return new UrlSegmentGroup(paths, {});
}
function createNewSegmentChildren(outlets) {
    const children = {};
    Object.entries(outlets).forEach(([outlet, commands]) => {
        if (typeof commands === 'string') {
            commands = [commands];
        }
        if (commands !== null) {
            children[outlet] = createNewSegmentGroup(new UrlSegmentGroup([], {}), 0, commands);
        }
    });
    return children;
}
function stringify(params) {
    const res = {};
    Object.entries(params).forEach(([k, v]) => (res[k] = `${v}`));
    return res;
}
function compare(path, params, segment) {
    return path == segment.path && shallowEqual(params, segment.parameters);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlX3VybF90cmVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9jcmVhdGVfdXJsX3RyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGFBQWEsSUFBSSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFJNUQsT0FBTyxFQUFTLGNBQWMsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNoRCxPQUFPLEVBQUMsVUFBVSxFQUFFLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ2hHLE9BQU8sRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0RHO0FBQ0gsTUFBTSxVQUFVLHlCQUF5QixDQUN2QyxVQUFrQyxFQUNsQyxRQUFlLEVBQ2YsY0FBNkIsSUFBSSxFQUNqQyxXQUEwQixJQUFJO0lBRTlCLE1BQU0seUJBQXlCLEdBQUcsMkJBQTJCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDMUUsT0FBTyw2QkFBNkIsQ0FBQyx5QkFBeUIsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ25HLENBQUM7QUFFRCxNQUFNLFVBQVUsMkJBQTJCLENBQUMsS0FBNkI7SUFDdkUsSUFBSSxXQUF3QyxDQUFDO0lBRTdDLFNBQVMsb0NBQW9DLENBQzNDLFlBQW9DO1FBRXBDLE1BQU0sWUFBWSxHQUF3QyxFQUFFLENBQUM7UUFDN0QsS0FBSyxNQUFNLGFBQWEsSUFBSSxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbEQsTUFBTSxJQUFJLEdBQUcsb0NBQW9DLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDakUsWUFBWSxDQUFDLGFBQWEs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RUQsU0FBUyxTQUFTLENBQUMsTUFBNEI7SUFDN0MsTUFBTSxHQUFHLEdBQTRCLEVBQUUsQ0FBQztJQUN4QyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM5RCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFFRCxTQUFTLE9BQU8sQ0FBQyxJQUFZLEVBQUUsTUFBNEIsRUFBRSxPQUFtQjtJQUM5RSxPQUFPLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLFlBQVksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7ybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQge0FjdGl2YXRlZFJvdXRlU25hcHNob3R9IGZyb20gJy4vcm91dGVyX3N0YXRlJztcbmltcG9ydCB7UGFyYW1zLCBQUklNQVJZX09VVExFVH0gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHtjcmVhdGVSb290LCBzcXVhc2hTZWdtZW50R3JvdXAsIFVybFNlZ21lbnQsIFVybFNlZ21lbnRHcm91cCwgVXJsVHJlZX0gZnJvbSAnLi91cmxfdHJlZSc7XG5pbXBvcnQge2xhc3QsIHNoYWxsb3dFcXVhbH0gZnJvbSAnLi91dGlscy9jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgYFVybFRyZWVgIHJlbGF0aXZlIHRvIGFuIGBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90YC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICpcbiAqIEBwYXJhbSByZWxhdGl2ZVRvIFRoZSBgQWN0aXZhdGVkUm91dGVTbmFwc2hvdGAgdG8gYXBwbHkgdGhlIGNvbW1hbmRzIHRvXG4gKiBAcGFyYW0gY29tbWFuZHMgQW4gYXJyYXkgb2YgVVJMIGZyYWdtZW50cyB3aXRoIHdoaWNoIHRvIGNvbnN0cnVjdCB0aGUgbmV3IFVSTCB0cmVlLlxuICogSWYgdGhlIHBhdGggaXMgc3RhdGljLCBjYW4gYmUgdGhlIGxpdGVyYWwgVVJMIHN0cmluZy4gRm9yIGEgZHluYW1pYyBwYXRoLCBwYXNzIGFuIGFycmF5IG9mIHBhdGhcbiAqIHNlZ21lbnRzLCBmb2xsb3dlZCBieSB0aGUgcGFyYW1ldGVycyBmb3IgZWFjaCBzZWdtZW50LlxuICogVGhlIGZyYWdtZW50cyBhcmUgYXBwbGllZCB0byB0aGUgb25lIHByb3ZpZGVkIGluIHRoZSBgcmVsYXRpdmVUb2AgcGFyYW1ldGVyLlxuICogQHBhcmFtIHF1ZXJ5UGFyYW1zIFRoZSBxdWVyeSBwYXJhbWV0ZXJzIGZvciB0aGUgYFVybFRyZWVgLiBgbnVsbGAgaWYgdGhlIGBVcmxUcmVlYCBkb2VzIG5vdCBoYXZlXG4gKiAgICAgYW55IHF1ZXJ5IHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0gZnJhZ21lbnQgVGhlIGZyYWdtZW50IGZvciB0aGUgYFVybFRyZWVgLiBgbnVsbGAgaWYgdGhlIGBVcmxUcmVlYCBkb2VzIG5vdCBoYXZlIGEgZnJhZ21lbnQuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBgYGBcbiAqIC8vIGNyZWF0ZSAvdGVhbS8zMy91c2VyLzExXG4gKiBjcmVhdGVVcmxUcmVlRnJvbVNuYXBzaG90KHNuYXBzaG90LCBbJy90ZWFtJywgMzMsICd1c2VyJywgMTFdKTtcbiAqXG4gKiAvLyBjcmVhdGUgL3RlYW0vMzM7ZXhwYW5kPXRydWUvdXNlci8xMVxuICogY3JlYXRlVXJsVHJlZUZyb21TbmFwc2hvdChzbmFwc2hvdCwgWycvdGVhbScsIDMzLCB7ZXhwYW5kOiB0cnVlfSwgJ3VzZXInLCAxMV0pO1xuICpcbiAqIC8vIHlvdSBjYW4gY29sbGFwc2Ugc3RhdGljIHNlZ21lbnRzIGxpa2UgdGhpcyAodGhpcyB3b3JrcyBvbmx5IHdpdGggdGhlIGZpcnN0IHBhc3NlZC1pbiB2YWx1ZSk6XG4gKiBjcmVhdGVVcmxUcmVlRnJvbVNuYXBzaG90KHNuYXBzaG90LCBbJy90ZWFtLzMzL3VzZXInLCB1c2VySWRdKTtcbiAqXG4gKiAvLyBJZiB0aGUgZmlyc3Qgc2VnbWVudCBjYW4gY29udGFpbiBzbGFzaGVzLCBhbmQgeW91IGRvIG5vdCB3YW50IHRoZSByb3V0ZXIgdG8gc3BsaXQgaXQsXG4gKiAvLyB5b3UgY2FuIGRvIHRoZSBmb2xsb3dpbmc6XG4gKiBjcmVhdGVVcmxUcmVlRnJvbVNuYXBzaG90KHNuYXBzaG90LCBbe3NlZ21lbnRQYXRoOiAnL29uZS90d28nfV0pO1xuICpcbiAqIC8vIGNyZWF0ZSAvdGVhbS8zMy8odXNlci8xMS8vcmlnaHQ6Y2hhdClcbiAqIGNyZWF0ZVVybFRyZWVGcm9tU25hcHNob3Qoc25hcHNob3QsIFsnL3RlYW0nLCAzMywge291dGxldHM6IHtwcmltYXJ5OiAndXNlci8xMScsIHJpZ2h0OlxuICogJ2NoYXQnfX1dLCBudWxsLCBudWxsKTtcbiAqXG4gKiAvLyByZW1vdmUgdGhlIHJpZ2h0IHNlY29uZGFyeSBub2RlXG4gKiBjcmVhdGVVcmxUcmVlRnJvbVNuYXBzaG90KHNuYXBzaG90LCBbJy90ZWFtJywgMzMsIHtvdXRsZXRzOiB7cHJpbWFyeTogJ3VzZXIvMTEnLCByaWdodDogbnVsbH19XSk7XG4gKlxuICogLy8gRm9yIHRoZSBleGFtcGxlcyBiZWxvdywgYXNzdW1lIHRoZSBjdXJyZW50IFVSTCBpcyBmb3IgdGhlIGAvdGVhbS8zMy91c2VyLzExYCBhbmQgdGhlXG4gKiBgQWN0aXZhdGVkUm91dGVTbmFwc2hvdGAgcG9pbnRzIHRvIGB1c2VyLzExYDpcbiAqXG4gKiAvLyBuYXZpZ2F0ZSB0byAvdGVhbS8zMy91c2VyLzExL2RldGFpbHNcbiAqIGNyZWF0ZVVybFRyZWVGcm9tU25hcHNob3Qoc25hcHNob3QsIFsnZGV0YWlscyddKTtcbiAqXG4gKiAvLyBuYXZpZ2F0ZSB0byAvdGVhbS8zMy91c2VyLzIyXG4gKiBjcmVhdGVVcmxUcmVlRnJvbVNuYXBzaG90KHNuYXBzaG90LCBbJy4uLzIyJ10pO1xuICpcbiAqIC8vIG5hdmlnYXRlIHRvIC90ZWFtLzQ0L3VzZXIvMjJcbiAqIGNyZWF0ZVVybFRyZWVGcm9tU25hcHNob3Qoc25hcHNob3QsIFsnLi4vLi4vdGVhbS80NC91c2VyLzIyJ10pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVVcmxUcmVlRnJvbVNuYXBzaG90KFxuICByZWxhdGl2ZVRvOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LFxuICBjb21tYW5kczogYW55W10sXG4gIHF1ZXJ5UGFyYW1zOiBQYXJhbXMgfCBudWxsID0gbnVsbCxcbiAgZnJhZ21lbnQ6IHN0cmluZyB8IG51bGwgPSBudWxsLFxuKTogVXJsVHJlZSB7XG4gIGNvbnN0IHJlbGF0aXZlVG9VcmxTZWdtZW50R3JvdXAgPSBjcmVhdGVTZWdtZW50R3JvdXBGcm9tUm91dGUocmVsYXRpdmVUbyk7XG4gIHJldHVybiBjcmVhdGVVcmxUcmVlRnJvbVNlZ21lbnRHcm91cChyZWxhdGl2ZVRvVXJsU2VnbWVudEdyb3VwLCBjb21tYW5kcywgcXVlcnlQYXJhbXMsIGZyYWdtZW50KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNlZ21lbnRHcm91cEZyb21Sb3V0ZShyb3V0ZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCk6IFVybFNlZ21lbnRHcm91cCB7XG4gIGxldCB0YXJnZXRHcm91cDogVXJsU2VnbWVudEdyb3VwIHwgdW5kZWZpbmVkO1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZVNlZ21lbnRHcm91cEZyb21Sb3V0ZVJlY3Vyc2l2ZShcbiAgICBjdXJyZW50Um91dGU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsXG4gICk6IFVybFNlZ21lbnRHcm91cCB7XG4gICAgY29uc3QgY2hpbGRPdXRsZXRzOiB7W291dGxldDogc3RyaW5nXTogVXJsU2VnbWVudEdyb3VwfSA9IHt9O1xuICAgIGZvciAoY29uc3QgY2hpbGRTbmFwc2hvdCBvZiBjdXJyZW50Um91dGUuY2hpbGRyZW4pIHtcbiAgICAgIGNvbnN0IHJvb3QgPSBjcmVhdGVTZWdtZW50R3JvdXBGcm9tUm91dGVSZWN1cnNpdmUoY2hpbGRTbmFwc2hvdCk7XG4gICAgICBjaGlsZE91dGxldHNbY2hpbGRTbmFwc2hvdC5vdXRsZXRdID0gcm9vdDtcbiAgICB9XG4gICAgY29uc3Qgc2VnbWVudEdyb3VwID0gbmV3IFVybFNlZ21lbnRHcm91cChjdXJyZW50Um91dGUudXJsLCBjaGlsZE91dGxldHMpO1xuICAgIGlmIChjdXJyZW50Um91dGUgPT09IHJvdXRlKSB7XG4gICAgICB0YXJnZXRHcm91cCA9IHNlZ21lbnRHcm91cDtcbiAgICB9XG4gICAgcmV0dXJuIHNlZ21lbnRHcm91cDtcbiAgfVxuICBjb25zdCByb290Q2FuZGlkYXRlID0gY3JlYXRlU2VnbWVudEdyb3VwRnJvbVJvdXRlUmVjdXJzaXZlKHJvdXRlLnJvb3QpO1xuICBjb25zdCByb290U2VnbWVudEdyb3VwID0gY3JlYXRlUm9vdChyb290Q2FuZGlkYXRlKTtcblxuICByZXR1cm4gdGFyZ2V0R3JvdXAgPz8gcm9vdFNlZ21lbnRHcm91cDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVVybFRyZWVGcm9tU2VnbWVudEdyb3VwKFxuICByZWxhdGl2ZVRvOiBVcmxTZWdtZW50R3JvdXAsXG4gIGNvbW1hbmRzOiBhbnlbXSxcbiAgcXVlcnlQYXJhbXM6IFBhcmFtcyB8IG51bGwsXG4gIGZyYWdtZW50OiBzdHJpbmcgfCBudWxsLFxuKTogVXJsVHJlZSB7XG4gIGxldCByb290ID0gcmVsYXRpdmVUbztcbiAgd2hpbGUgKHJvb3QucGFyZW50KSB7XG4gICAgcm9vdCA9IHJvb3QucGFyZW50O1xuICB9XG4gIC8vIFRoZXJlIGFyZSBubyBjb21tYW5kcyBzbyB0aGUgYFVybFRyZWVgIGdvZXMgdG8gdGhlIHNhbWUgcGF0aCBhcyB0aGUgb25lIGNyZWF0ZWQgZnJvbSB0aGVcbiAgLy8gYFVybFNlZ21lbnRHcm91cGAuIEFsbCB3ZSBuZWVkIHRvIGRvIGlzIHVwZGF0ZSB0aGUgYHF1ZXJ5UGFyYW1zYCBhbmQgYGZyYWdtZW50YCB3aXRob3V0XG4gIC8vIGFwcGx5aW5nIGFueSBvdGhlciBsb2dpYy5cbiAgaWYgKGNvbW1hbmRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0cmVlKHJvb3QsIHJvb3QsIHJvb3QsIHF1ZXJ5UGFyYW1zLCBmcmFnbWVudCk7XG4gIH1cblxuICBjb25zdCBuYXYgPSBjb21wdXRlTmF2aWdhdGlvbihjb21tYW5kcyk7XG5cbiAgaWYgKG5hdi50b1Jvb3QoKSkge1xuICAgIHJldHVybiB0cmVlKHJvb3QsIHJvb3QsIG5ldyBVcmxTZWdtZW50R3JvdXAoW10sIHt9KSwgcXVlcnlQYXJhbXMsIGZyYWdtZW50KTtcbiAgfVxuXG4gIGNvbnN0IHBvc2l0aW9uID0gZmluZFN0YXJ0aW5nUG9zaXRpb25Gb3JUYXJnZXRHcm91cChuYXYsIHJvb3QsIHJlbGF0aXZlVG8pO1xuICBjb25zdCBuZXdTZWdtZW50R3JvdXAgPSBwb3NpdGlvbi5wcm9jZXNzQ2hpbGRyZW5cbiAgICA/IHVwZGF0ZVNlZ21lbnRHcm91cENoaWxkcmVuKHBvc2l0aW9uLnNlZ21lbnRHcm91cCwgcG9zaXRpb24uaW5kZXgsIG5hdi5jb21tYW5kcylcbiAgICA6IHVwZGF0ZVNlZ21lbnRHcm91cChwb3NpdGlvbi5zZWdtZW50R3JvdXAsIHBvc2l0aW9uLmluZGV4LCBuYXYuY29tbWFuZHMpO1xuICByZXR1cm4gdHJlZShyb290LCBwb3NpdGlvbi5zZWdtZW50R3JvdXAsIG5ld1NlZ21lbnRHcm91cCwgcXVlcnlQYXJhbXMsIGZyYWdtZW50KTtcbn1cblxuZnVuY3Rpb24gaXNNYXRyaXhQYXJhbXMoY29tbWFuZDogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlb2YgY29tbWFuZCA9PT0gJ29iamVjdCcgJiYgY29tbWFuZCAhPSBudWxsICYmICFjb21tYW5kLm91dGxldHMgJiYgIWNvbW1hbmQuc2VnbWVudFBhdGg7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiBhIGdpdmVuIGNvbW1hbmQgaGFzIGFuIGBvdXRsZXRzYCBtYXAuIFdoZW4gd2UgZW5jb3VudGVyIGEgY29tbWFuZFxuICogd2l0aCBhbiBvdXRsZXRzIGsvdiBtYXAsIHdlIG5lZWQgdG8gYXBwbHkgZWFjaCBvdXRsZXQgaW5kaXZpZHVhbGx5IHRvIHRoZSBleGlzdGluZyBzZWdtZW50LlxuICovXG5mdW5jdGlvbiBpc0NvbW1hbmRXaXRoT3V0bGV0cyhjb21tYW5kOiBhbnkpOiBjb21tYW5kIGlzIHtvdXRsZXRzOiB7W2tleTogc3RyaW5nXTogYW55fX0ge1xuICByZXR1cm4gdHlwZW9mIGNvbW1hbmQgPT09ICdvYmplY3QnICYmIGNvbW1hbmQgIT0gbnVsbCAmJiBjb21tYW5kLm91dGxldHM7XG59XG5cbmZ1bmN0aW9uIHRyZWUoXG4gIG9sZFJvb3Q6IFVybFNlZ21lbnRHcm91cCxcbiAgb2xkU2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsXG4gIG5ld1NlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLFxuICBxdWVyeVBhcmFtczogUGFyYW1zIHwgbnVsbCxcbiAgZnJhZ21lbnQ6IHN0cmluZyB8IG51bGwsXG4pOiBVcmxUcmVlIHtcbiAgbGV0IHFwOiBhbnkgPSB7fTtcbiAgaWYgKHF1ZXJ5UGFyYW1zKSB7XG4gICAgT2JqZWN0LmVudHJpZXMocXVlcnlQYXJhbXMpLmZvckVhY2goKFtuYW1lLCB2YWx1ZV0pID0+IHtcbiAgICAgIHFwW25hbWVdID0gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZS5tYXAoKHY6IGFueSkgPT4gYCR7dn1gKSA6IGAke3ZhbHVlfWA7XG4gICAgfSk7XG4gIH1cblxuICBsZXQgcm9vdENhbmRpZGF0ZTogVXJsU2VnbWVudEdyb3VwO1xuICBpZiAob2xkUm9vdCA9PT0gb2xkU2VnbWVudEdyb3VwKSB7XG4gICAgcm9vdENhbmRpZGF0ZSA9IG5ld1NlZ21lbnRHcm91cDtcbiAgfSBlbHNlIHtcbiAgICByb290Q2FuZGlkYXRlID0gcmVwbGFjZVNlZ21lbnQob2xkUm9vdCwgb2xkU2VnbWVudEdyb3VwLCBuZXdTZWdtZW50R3JvdXApO1xuICB9XG5cbiAgY29uc3QgbmV3Um9vdCA9IGNyZWF0ZVJvb3Qoc3F1YXNoU2VnbWVudEdyb3VwKHJvb3RDYW5kaWRhdGUpKTtcbiAgcmV0dXJuIG5ldyBVcmxUcmVlKG5ld1Jvb3QsIHFwLCBmcmFnbWVudCk7XG59XG5cbi8qKlxuICogUmVwbGFjZXMgdGhlIGBvbGRTZWdtZW50YCB3aGljaCBpcyBsb2NhdGVkIGluIHNvbWUgY2hpbGQgb2YgdGhlIGBjdXJyZW50YCB3aXRoIHRoZSBgbmV3U2VnbWVudGAuXG4gKiBUaGlzIGFsc28gaGFzIHRoZSBlZmZlY3Qgb2YgY3JlYXRpbmcgbmV3IGBVcmxTZWdtZW50R3JvdXBgIGNvcGllcyB0byB1cGRhdGUgcmVmZXJlbmNlcy4gVGhpc1xuICogc2hvdWxkbid0IGJlIG5lY2Vzc2FyeSBidXQgdGhlIGZhbGxiYWNrIGxvZ2ljIGZvciBhbiBpbnZhbGlkIEFjdGl2YXRlZFJvdXRlIGluIHRoZSBjcmVhdGlvbiB1c2VzXG4gKiB0aGUgUm91dGVyJ3MgY3VycmVudCB1cmwgdHJlZS4gSWYgd2UgZG9uJ3QgY3JlYXRlIG5ldyBzZWdtZW50IGdyb3Vwcywgd2UgZW5kIHVwIG1vZGlmeWluZyB0aGF0XG4gKiB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gcmVwbGFjZVNlZ21lbnQoXG4gIGN1cnJlbnQ6IFVybFNlZ21lbnRHcm91cCxcbiAgb2xkU2VnbWVudDogVXJsU2VnbWVudEdyb3VwLFxuICBuZXdTZWdtZW50OiBVcmxTZWdtZW50R3JvdXAsXG4pOiBVcmxTZWdtZW50R3JvdXAge1xuICBjb25zdCBjaGlsZHJlbjoge1trZXk6IHN0cmluZ106IFVybFNlZ21lbnRHcm91cH0gPSB7fTtcbiAgT2JqZWN0LmVudHJpZXMoY3VycmVudC5jaGlsZHJlbikuZm9yRWFjaCgoW291dGxldE5hbWUsIGNdKSA9PiB7XG4gICAgaWYgKGMgPT09IG9sZFNlZ21lbnQpIHtcbiAgICAgIGNoaWxkcmVuW291dGxldE5hbWVdID0gbmV3U2VnbWVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hpbGRyZW5bb3V0bGV0TmFtZV0gPSByZXBsYWNlU2VnbWVudChjLCBvbGRTZWdtZW50LCBuZXdTZWdtZW50KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gbmV3IFVybFNlZ21lbnRHcm91cChjdXJyZW50LnNlZ21lbnRzLCBjaGlsZHJlbik7XG59XG5cbmNsYXNzIE5hdmlnYXRpb24ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgaXNBYnNvbHV0ZTogYm9vbGVhbixcbiAgICBwdWJsaWMgbnVtYmVyT2ZEb3VibGVEb3RzOiBudW1iZXIsXG4gICAgcHVibGljIGNvbW1hbmRzOiBhbnlbXSxcbiAgKSB7XG4gICAgaWYgKGlzQWJzb2x1dGUgJiYgY29tbWFuZHMubGVuZ3RoID4gMCAmJiBpc01hdHJpeFBhcmFtcyhjb21tYW5kc1swXSkpIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuUk9PVF9TRUdNRU5UX01BVFJJWF9QQVJBTVMsXG4gICAgICAgICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmXG4gICAgICAgICAgJ1Jvb3Qgc2VnbWVudCBjYW5ub3QgaGF2ZSBtYXRyaXggcGFyYW1ldGVycycsXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IGNtZFdpdGhPdXRsZXQgPSBjb21tYW5kcy5maW5kKGlzQ29tbWFuZFdpdGhPdXRsZXRzKTtcbiAgICBpZiAoY21kV2l0aE91dGxldCAmJiBjbWRXaXRoT3V0bGV0ICE9PSBsYXN0KGNvbW1hbmRzKSkge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5NSVNQTEFDRURfT1VUTEVUU19DT01NQU5ELFxuICAgICAgICAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJlxuICAgICAgICAgICd7b3V0bGV0czp7fX0gaGFzIHRvIGJlIHRoZSBsYXN0IGNvbW1hbmQnLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgdG9Sb290KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzQWJzb2x1dGUgJiYgdGhpcy5jb21tYW5kcy5sZW5ndGggPT09IDEgJiYgdGhpcy5jb21tYW5kc1swXSA9PSAnLyc7XG4gIH1cbn1cblxuLyoqIFRyYW5zZm9ybXMgY29tbWFuZHMgdG8gYSBub3JtYWxpemVkIGBOYXZpZ2F0aW9uYCAqL1xuZnVuY3Rpb24gY29tcHV0ZU5hdmlnYXRpb24oY29tbWFuZHM6IGFueVtdKTogTmF2aWdhdGlvbiB7XG4gIGlmICh0eXBlb2YgY29tbWFuZHNbMF0gPT09ICdzdHJpbmcnICYmIGNvbW1hbmRzLmxlbmd0aCA9PT0gMSAmJiBjb21tYW5kc1swXSA9PT0gJy8nKSB7XG4gICAgcmV0dXJuIG5ldyBOYXZpZ2F0aW9uKHRydWUsIDAsIGNvbW1hbmRzKTtcbiAgfVxuXG4gIGxldCBudW1iZXJPZkRvdWJsZURvdHMgPSAwO1xuICBsZXQgaXNBYnNvbHV0ZSA9IGZhbHNlO1xuXG4gIGNvbnN0IHJlczogYW55W10gPSBjb21tYW5kcy5yZWR1Y2UoKHJlcywgY21kLCBjbWRJZHgpID0+IHtcbiAgICBpZiAodHlwZW9mIGNtZCA9PT0gJ29iamVjdCcgJiYgY21kICE9IG51bGwpIHtcbiAgICAgIGlmIChjbWQub3V0bGV0cykge1xuICAgICAgICBjb25zdCBvdXRsZXRzOiB7W2s6IHN0cmluZ106IGFueX0gPSB7fTtcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoY21kLm91dGxldHMpLmZvckVhY2goKFtuYW1lLCBjb21tYW5kc10pID0+IHtcbiAgICAgICAgICBvdXRsZXRzW25hbWVdID0gdHlwZW9mIGNvbW1hbmRzID09PSAnc3RyaW5nJyA/IGNvbW1hbmRzLnNwbGl0KCcvJykgOiBjb21tYW5kcztcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBbLi4ucmVzLCB7b3V0bGV0c31dO1xuICAgICAgfVxuXG4gICAgICBpZiAoY21kLnNlZ21lbnRQYXRoKSB7XG4gICAgICAgIHJldHVybiBbLi4ucmVzLCBjbWQuc2VnbWVudFBhdGhdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghKHR5cGVvZiBjbWQgPT09ICdzdHJpbmcnKSkge1xuICAgICAgcmV0dXJuIFsuLi5yZXMsIGNtZF07XG4gICAgfVxuXG4gICAgaWYgKGNtZElkeCA9PT0gMCkge1xuICAgICAgY21kLnNwbGl0KCcvJykuZm9yRWFjaCgodXJsUGFydCwgcGFydEluZGV4KSA9PiB7XG4gICAgICAgIGlmIChwYXJ0SW5kZXggPT0gMCAmJiB1cmxQYXJ0ID09PSAnLicpIHtcbiAgICAgICAgICAvLyBza2lwICcuL2EnXG4gICAgICAgIH0gZWxzZSBpZiAocGFydEluZGV4ID09IDAgJiYgdXJsUGFydCA9PT0gJycpIHtcbiAgICAgICAgICAvLyAgJy9hJ1xuICAgICAgICAgIGlzQWJzb2x1dGUgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHVybFBhcnQgPT09ICcuLicpIHtcbiAgICAgICAgICAvLyAgJy4uL2EnXG4gICAgICAgICAgbnVtYmVyT2ZEb3VibGVEb3RzKys7XG4gICAgICAgIH0gZWxzZSBpZiAodXJsUGFydCAhPSAnJykge1xuICAgICAgICAgIHJlcy5wdXNoKHVybFBhcnQpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICByZXR1cm4gWy4uLnJlcywgY21kXTtcbiAgfSwgW10pO1xuXG4gIHJldHVybiBuZXcgTmF2aWdhdGlvbihpc0Fic29sdXRlLCBudW1iZXJPZkRvdWJsZURvdHMsIHJlcyk7XG59XG5cbmNsYXNzIFBvc2l0aW9uIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLFxuICAgIHB1YmxpYyBwcm9jZXNzQ2hpbGRyZW46IGJvb2xlYW4sXG4gICAgcHVibGljIGluZGV4OiBudW1iZXIsXG4gICkge31cbn1cblxuZnVuY3Rpb24gZmluZFN0YXJ0aW5nUG9zaXRpb25Gb3JUYXJnZXRHcm91cChcbiAgbmF2OiBOYXZpZ2F0aW9uLFxuICByb290OiBVcmxTZWdtZW50R3JvdXAsXG4gIHRhcmdldDogVXJsU2VnbWVudEdyb3VwLFxuKTogUG9zaXRpb24ge1xuICBpZiAobmF2LmlzQWJzb2x1dGUpIHtcbiAgICByZXR1cm4gbmV3IFBvc2l0aW9uKHJvb3QsIHRydWUsIDApO1xuICB9XG5cbiAgaWYgKCF0YXJnZXQpIHtcbiAgICAvLyBgTmFOYCBpcyB1c2VkIG9ubHkgdG8gbWFpbnRhaW4gYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgd2l0aCBpbmNvcnJlY3RseSBtb2NrZWRcbiAgICAvLyBgQWN0aXZhdGVkUm91dGVTbmFwc2hvdGAgaW4gdGVzdHMuIEluIHByaW9yIHZlcnNpb25zIG9mIHRoaXMgY29kZSwgdGhlIHBvc2l0aW9uIGhlcmUgd2FzXG4gICAgLy8gZGV0ZXJtaW5lZCBiYXNlZCBvbiBhbiBpbnRlcm5hbCBwcm9wZXJ0eSB0aGF0IHdhcyByYXJlbHkgbW9ja2VkLCByZXN1bHRpbmcgaW4gYE5hTmAuIEluXG4gICAgLy8gcmVhbGl0eSwgdGhpcyBjb2RlIHBhdGggc2hvdWxkIF9uZXZlcl8gYmUgdG91Y2hlZCBzaW5jZSBgdGFyZ2V0YCBpcyBub3QgYWxsb3dlZCB0byBiZSBmYWxzZXkuXG4gICAgcmV0dXJuIG5ldyBQb3NpdGlvbihyb290LCBmYWxzZSwgTmFOKTtcbiAgfVxuICBpZiAodGFyZ2V0LnBhcmVudCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgUG9zaXRpb24odGFyZ2V0LCB0cnVlLCAwKTtcbiAgfVxuXG4gIGNvbnN0IG1vZGlmaWVyID0gaXNNYXRyaXhQYXJhbXMobmF2LmNvbW1hbmRzWzBdKSA/IDAgOiAxO1xuICBjb25zdCBpbmRleCA9IHRhcmdldC5zZWdtZW50cy5sZW5ndGggLSAxICsgbW9kaWZpZXI7XG4gIHJldHVybiBjcmVhdGVQb3NpdGlvbkFwcGx5aW5nRG91YmxlRG90cyh0YXJnZXQsIGluZGV4LCBuYXYubnVtYmVyT2ZEb3VibGVEb3RzKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUG9zaXRpb25BcHBseWluZ0RvdWJsZURvdHMoXG4gIGdyb3VwOiBVcmxTZWdtZW50R3JvdXAsXG4gIGluZGV4OiBudW1iZXIsXG4gIG51bWJlck9mRG91YmxlRG90czogbnVtYmVyLFxuKTogUG9zaXRpb24ge1xuICBsZXQgZyA9IGdyb3VwO1xuICBsZXQgY2kgPSBpbmRleDtcbiAgbGV0IGRkID0gbnVtYmVyT2ZEb3VibGVEb3RzO1xuICB3aGlsZSAoZGQgPiBjaSkge1xuICAgIGRkIC09IGNpO1xuICAgIGcgPSBnLnBhcmVudCE7XG4gICAgaWYgKCFnKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfRE9VQkxFX0RPVFMsXG4gICAgICAgICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmIFwiSW52YWxpZCBudW1iZXIgb2YgJy4uLydcIixcbiAgICAgICk7XG4gICAgfVxuICAgIGNpID0gZy5zZWdtZW50cy5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIG5ldyBQb3NpdGlvbihnLCBmYWxzZSwgY2kgLSBkZCk7XG59XG5cbmZ1bmN0aW9uIGdldE91dGxldHMoY29tbWFuZHM6IHVua25vd25bXSk6IHtbazogc3RyaW5nXTogdW5rbm93bltdIHwgc3RyaW5nfSB7XG4gIGlmIChpc0NvbW1hbmRXaXRoT3V0bGV0cyhjb21tYW5kc1swXSkpIHtcbiAgICByZXR1cm4gY29tbWFuZHNbMF0ub3V0bGV0cztcbiAgfVxuXG4gIHJldHVybiB7W1BSSU1BUllfT1VUTEVUXTogY29tbWFuZHN9O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVTZWdtZW50R3JvdXAoXG4gIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwIHwgdW5kZWZpbmVkLFxuICBzdGFydEluZGV4OiBudW1iZXIsXG4gIGNvbW1hbmRzOiBhbnlbXSxcbik6IFVybFNlZ21lbnRHcm91cCB7XG4gIHNlZ21lbnRHcm91cCA/Pz0gbmV3IFVybFNlZ21lbnRHcm91cChbXSwge30pO1xuICBpZiAoc2VnbWVudEdyb3VwLnNlZ21lbnRzLmxlbmd0aCA9PT0gMCAmJiBzZWdtZW50R3JvdXAuaGFzQ2hpbGRyZW4oKSkge1xuICAgIHJldHVybiB1cGRhdGVTZWdtZW50R3JvdXBDaGlsZHJlbihzZWdtZW50R3JvdXAsIHN0YXJ0SW5kZXgsIGNvbW1hbmRzKTtcbiAgfVxuXG4gIGNvbnN0IG0gPSBwcmVmaXhlZFdpdGgoc2VnbWVudEdyb3VwLCBzdGFydEluZGV4LCBjb21tYW5kcyk7XG4gIGNvbnN0IHNsaWNlZENvbW1hbmRzID0gY29tbWFuZHMuc2xpY2UobS5jb21tYW5kSW5kZXgpO1xuICBpZiAobS5tYXRjaCAmJiBtLnBhdGhJbmRleCA8IHNlZ21lbnRHcm91cC5zZWdtZW50cy5sZW5ndGgpIHtcbiAgICBjb25zdCBnID0gbmV3IFVybFNlZ21lbnRHcm91cChzZWdtZW50R3JvdXAuc2VnbWVudHMuc2xpY2UoMCwgbS5wYXRoSW5kZXgpLCB7fSk7XG4gICAgZy5jaGlsZHJlbltQUklNQVJZX09VVExFVF0gPSBuZXcgVXJsU2VnbWVudEdyb3VwKFxuICAgICAgc2VnbWVudEdyb3VwLnNlZ21lbnRzLnNsaWNlKG0ucGF0aEluZGV4KSxcbiAgICAgIHNlZ21lbnRHcm91cC5jaGlsZHJlbixcbiAgICApO1xuICAgIHJldHVybiB1cGRhdGVTZWdtZW50R3JvdXBDaGlsZHJlbihnLCAwLCBzbGljZWRDb21tYW5kcyk7XG4gIH0gZWxzZSBpZiAobS5tYXRjaCAmJiBzbGljZWRDb21tYW5kcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IFVybFNlZ21lbnRHcm91cChzZWdtZW50R3JvdXAuc2VnbWVudHMsIHt9KTtcbiAgfSBlbHNlIGlmIChtLm1hdGNoICYmICFzZWdtZW50R3JvdXAuaGFzQ2hpbGRyZW4oKSkge1xuICAgIHJldHVybiBjcmVhdGVOZXdTZWdtZW50R3JvdXAoc2VnbWVudEdyb3VwLCBzdGFydEluZGV4LCBjb21tYW5kcyk7XG4gIH0gZWxzZSBpZiAobS5tYXRjaCkge1xuICAgIHJldHVybiB1cGRhdGVTZWdtZW50R3JvdXBDaGlsZHJlbihzZWdtZW50R3JvdXAsIDAsIHNsaWNlZENvbW1hbmRzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY3JlYXRlTmV3U2VnbWVudEdyb3VwKHNlZ21lbnRHcm91cCwgc3RhcnRJbmRleCwgY29tbWFuZHMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVNlZ21lbnRHcm91cENoaWxkcmVuKFxuICBzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCxcbiAgc3RhcnRJbmRleDogbnVtYmVyLFxuICBjb21tYW5kczogYW55W10sXG4pOiBVcmxTZWdtZW50R3JvdXAge1xuICBpZiAoY29tbWFuZHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBVcmxTZWdtZW50R3JvdXAoc2VnbWVudEdyb3VwLnNlZ21lbnRzLCB7fSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3Qgb3V0bGV0cyA9IGdldE91dGxldHMoY29tbWFuZHMpO1xuICAgIGNvbnN0IGNoaWxkcmVuOiB7W2tleTogc3RyaW5nXTogVXJsU2VnbWVudEdyb3VwfSA9IHt9O1xuICAgIC8vIElmIHRoZSBzZXQgb2YgY29tbWFuZHMgYXBwbGllcyB0byBhbnl0aGluZyBvdGhlciB0aGFuIHRoZSBwcmltYXJ5IG91dGxldCBhbmQgdGhlIGNoaWxkXG4gICAgLy8gc2VnbWVudCBpcyBhbiBlbXB0eSBwYXRoIHByaW1hcnkgc2VnbWVudCBvbiBpdHMgb3duLCB3ZSB3YW50IHRvIGFwcGx5IHRoZSBjb21tYW5kcyB0byB0aGVcbiAgICAvLyBlbXB0eSBjaGlsZCBwYXRoIHJhdGhlciB0aGFuIGhlcmUuIFRoZSBvdXRjb21lIGlzIHRoYXQgdGhlIGVtcHR5IHByaW1hcnkgY2hpbGQgaXMgZWZmZWN0aXZlbHlcbiAgICAvLyByZW1vdmVkIGZyb20gdGhlIGZpbmFsIG91dHB1dCBVcmxUcmVlLiBJbWFnaW5lIHRoZSBmb2xsb3dpbmcgY29uZmlnOlxuICAgIC8vXG4gICAgLy8ge3BhdGg6ICcnLCBjaGlsZHJlbjogW3twYXRoOiAnKionLCBvdXRsZXQ6ICdwb3B1cCd9XX0uXG4gICAgLy9cbiAgICAvLyBOYXZpZ2F0aW9uIHRvIC8ocG9wdXA6YSkgd2lsbCBhY3RpdmF0ZSB0aGUgY2hpbGQgb3V0bGV0IGNvcnJlY3RseSBHaXZlbiBhIGZvbGxvdy11cFxuICAgIC8vIG5hdmlnYXRpb24gd2l0aCBjb21tYW5kc1xuICAgIC8vIFsnLycsIHtvdXRsZXRzOiB7J3BvcHVwJzogJ2InfX1dLCB3ZSBfd291bGQgbm90XyB3YW50IHRvIGFwcGx5IHRoZSBvdXRsZXQgY29tbWFuZHMgdG8gdGhlXG4gICAgLy8gcm9vdCBzZWdtZW50IGJlY2F1c2UgdGhhdCB3b3VsZCByZXN1bHQgaW5cbiAgICAvLyAvLyhwb3B1cDphKShwb3B1cDpiKSBzaW5jZSB0aGUgb3V0bGV0IGNvbW1hbmQgZ290IGFwcGxpZWQgb25lIGxldmVsIGFib3ZlIHdoZXJlIGl0IGFwcGVhcnMgaW5cbiAgICAvLyB0aGUgYEFjdGl2YXRlZFJvdXRlYCByYXRoZXIgdGhhbiB1cGRhdGluZyB0aGUgZXhpc3Rpbmcgb25lLlxuICAgIC8vXG4gICAgLy8gQmVjYXVzZSBlbXB0eSBwYXRocyBkbyBub3QgYXBwZWFyIGluIHRoZSBVUkwgc2VnbWVudHMgYW5kIHRoZSBmYWN0IHRoYXQgdGhlIHNlZ21lbnRzIHVzZWQgaW5cbiAgICAvLyB0aGUgb3V0cHV0IGBVcmxUcmVlYCBhcmUgc3F1YXNoZWQgdG8gZWxpbWluYXRlIHRoZXNlIGVtcHR5IHBhdGhzIHdoZXJlIHBvc3NpYmxlXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9ibG9iLzEzZjEwZGU0MGUyNWM2OTAwY2E1NWJkODNiMzZiZDUzM2RhY2ZhOWUvcGFja2FnZXMvcm91dGVyL3NyYy91cmxfdHJlZS50cyNMNzU1XG4gICAgLy8gaXQgY2FuIGJlIGhhcmQgdG8gZGV0ZXJtaW5lIHdoYXQgaXMgdGhlIHJpZ2h0IHRoaW5nIHRvIGRvIHdoZW4gYXBwbHlpbmcgY29tbWFuZHMgdG8gYVxuICAgIC8vIGBVcmxTZWdtZW50R3JvdXBgIHRoYXQgaXMgY3JlYXRlZCBmcm9tIGFuIFwidW5zcXVhc2hlZFwiL2V4cGFuZGVkIGBBY3RpdmF0ZWRSb3V0ZWAgdHJlZS5cbiAgICAvLyBUaGlzIGNvZGUgZWZmZWN0aXZlbHkgXCJzcXVhc2hlc1wiIGVtcHR5IHBhdGggcHJpbWFyeSByb3V0ZXMgd2hlbiB0aGV5IGhhdmUgbm8gc2libGluZ3Mgb25cbiAgICAvLyB0aGUgc2FtZSBsZXZlbCBvZiB0aGUgdHJlZS5cbiAgICBpZiAoXG4gICAgICBPYmplY3Qua2V5cyhvdXRsZXRzKS5zb21lKChvKSA9PiBvICE9PSBQUklNQVJZX09VVExFVCkgJiZcbiAgICAgIHNlZ21lbnRHcm91cC5jaGlsZHJlbltQUklNQVJZX09VVExFVF0gJiZcbiAgICAgIHNlZ21lbnRHcm91cC5udW1iZXJPZkNoaWxkcmVuID09PSAxICYmXG4gICAgICBzZWdtZW50R3JvdXAuY2hpbGRyZW5bUFJJTUFSWV9PVVRMRVRdLnNlZ21lbnRzLmxlbmd0aCA9PT0gMFxuICAgICkge1xuICAgICAgY29uc3QgY2hpbGRyZW5PZkVtcHR5Q2hpbGQgPSB1cGRhdGVTZWdtZW50R3JvdXBDaGlsZHJlbihcbiAgICAgICAgc2VnbWVudEdyb3VwLmNoaWxkcmVuW1BSSU1BUllfT1VUTEVUXSxcbiAgICAgICAgc3RhcnRJbmRleCxcbiAgICAgICAgY29tbWFuZHMsXG4gICAgICApO1xuICAgICAgcmV0dXJuIG5ldyBVcmxTZWdtZW50R3JvdXAoc2VnbWVudEdyb3VwLnNlZ21lbnRzLCBjaGlsZHJlbk9mRW1wdHlDaGlsZC5jaGlsZHJlbik7XG4gICAgfVxuXG4gICAgT2JqZWN0LmVudHJpZXMob3V0bGV0cykuZm9yRWFjaCgoW291dGxldCwgY29tbWFuZHNdKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGNvbW1hbmRzID09PSAnc3RyaW5nJykge1xuICAgICAgICBjb21tYW5kcyA9IFtjb21tYW5kc107XG4gICAgICB9XG4gICAgICBpZiAoY29tbWFuZHMgIT09IG51bGwpIHtcbiAgICAgICAgY2hpbGRyZW5bb3V0bGV0XSA9IHVwZGF0ZVNlZ21lbnRHcm91cChzZWdtZW50R3JvdXAuY2hpbGRyZW5bb3V0bGV0XSwgc3RhcnRJbmRleCwgY29tbWFuZHMpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmVudHJpZXMoc2VnbWVudEdyb3VwLmNoaWxkcmVuKS5mb3JFYWNoKChbY2hpbGRPdXRsZXQsIGNoaWxkXSkgPT4ge1xuICAgICAgaWYgKG91dGxldHNbY2hpbGRPdXRsZXRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY2hpbGRyZW5bY2hpbGRPdXRsZXRdID0gY2hpbGQ7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG5ldyBVcmxTZWdtZW50R3JvdXAoc2VnbWVudEdyb3VwLnNlZ21lbnRzLCBjaGlsZHJlbik7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJlZml4ZWRXaXRoKHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLCBzdGFydEluZGV4OiBudW1iZXIsIGNvbW1hbmRzOiBhbnlbXSkge1xuICBsZXQgY3VycmVudENvbW1hbmRJbmRleCA9IDA7XG4gIGxldCBjdXJyZW50UGF0aEluZGV4ID0gc3RhcnRJbmRleDtcblxuICBjb25zdCBub01hdGNoID0ge21hdGNoOiBmYWxzZSwgcGF0aEluZGV4OiAwLCBjb21tYW5kSW5kZXg6IDB9O1xuICB3aGlsZSAoY3VycmVudFBhdGhJbmRleCA8IHNlZ21lbnRHcm91cC5zZWdtZW50cy5sZW5ndGgpIHtcbiAgICBpZiAoY3VycmVudENvbW1hbmRJbmRleCA+PSBjb21tYW5kcy5sZW5ndGgpIHJldHVybiBub01hdGNoO1xuICAgIGNvbnN0IHBhdGggPSBzZWdtZW50R3JvdXAuc2VnbWVudHNbY3VycmVudFBhdGhJbmRleF07XG4gICAgY29uc3QgY29tbWFuZCA9IGNvbW1hbmRzW2N1cnJlbnRDb21tYW5kSW5kZXhdO1xuICAgIC8vIERvIG5vdCB0cnkgdG8gY29uc3VtZSBjb21tYW5kIGFzIHBhcnQgb2YgdGhlIHByZWZpeGluZyBpZiBpdCBoYXMgb3V0bGV0cyBiZWNhdXNlIGl0IGNhblxuICAgIC8vIGNvbnRhaW4gb3V0bGV0cyBvdGhlciB0aGFuIHRoZSBvbmUgYmVpbmcgcHJvY2Vzc2VkLiBDb25zdW1pbmcgdGhlIG91dGxldHMgY29tbWFuZCB3b3VsZFxuICAgIC8vIHJlc3VsdCBpbiBvdGhlciBvdXRsZXRzIGJlaW5nIGlnbm9yZWQuXG4gICAgaWYgKGlzQ29tbWFuZFdpdGhPdXRsZXRzKGNvbW1hbmQpKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY29uc3QgY3VyciA9IGAke2NvbW1hbmR9YDtcbiAgICBjb25zdCBuZXh0ID1cbiAgICAgIGN1cnJlbnRDb21tYW5kSW5kZXggPCBjb21tYW5kcy5sZW5ndGggLSAxID8gY29tbWFuZHNbY3VycmVudENvbW1hbmRJbmRleCArIDFdIDogbnVsbDtcblxuICAgIGlmIChjdXJyZW50UGF0aEluZGV4ID4gMCAmJiBjdXJyID09PSB1bmRlZmluZWQpIGJyZWFrO1xuXG4gICAgaWYgKGN1cnIgJiYgbmV4dCAmJiB0eXBlb2YgbmV4dCA9PT0gJ29iamVjdCcgJiYgbmV4dC5vdXRsZXRzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICghY29tcGFyZShjdXJyLCBuZXh0LCBwYXRoKSkgcmV0dXJuIG5vTWF0Y2g7XG4gICAgICBjdXJyZW50Q29tbWFuZEluZGV4ICs9IDI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghY29tcGFyZShjdXJyLCB7fSwgcGF0aCkpIHJldHVybiBub01hdGNoO1xuICAgICAgY3VycmVudENvbW1hbmRJbmRleCsrO1xuICAgIH1cbiAgICBjdXJyZW50UGF0aEluZGV4Kys7XG4gIH1cblxuICByZXR1cm4ge21hdGNoOiB0cnVlLCBwYXRoSW5kZXg6IGN1cnJlbnRQYXRoSW5kZXgsIGNvbW1hbmRJbmRleDogY3VycmVudENvbW1hbmRJbmRleH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU5ld1NlZ21lbnRHcm91cChcbiAgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsXG4gIHN0YXJ0SW5kZXg6IG51bWJlcixcbiAgY29tbWFuZHM6IGFueVtdLFxuKTogVXJsU2VnbWVudEdyb3VwIHtcbiAgY29uc3QgcGF0aHMgPSBzZWdtZW50R3JvdXAuc2VnbWVudHMuc2xpY2UoMCwgc3RhcnRJbmRleCk7XG5cbiAgbGV0IGkgPSAwO1xuICB3aGlsZSAoaSA8IGNvbW1hbmRzLmxlbmd0aCkge1xuICAgIGNvbnN0IGNvbW1hbmQgPSBjb21tYW5kc1tpXTtcbiAgICBpZiAoaXNDb21tYW5kV2l0aE91dGxldHMoY29tbWFuZCkpIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gY3JlYXRlTmV3U2VnbWVudENoaWxkcmVuKGNvbW1hbmQub3V0bGV0cyk7XG4gICAgICByZXR1cm4gbmV3IFVybFNlZ21lbnRHcm91cChwYXRocywgY2hpbGRyZW4pO1xuICAgIH1cblxuICAgIC8vIGlmIHdlIHN0YXJ0IHdpdGggYW4gb2JqZWN0IGxpdGVyYWwsIHdlIG5lZWQgdG8gcmV1c2UgdGhlIHBhdGggcGFydCBmcm9tIHRoZSBzZWdtZW50XG4gICAgaWYgKGkgPT09IDAgJiYgaXNNYXRyaXhQYXJhbXMoY29tbWFuZHNbMF0pKSB7XG4gICAgICBjb25zdCBwID0gc2VnbWVudEdyb3VwLnNlZ21lbnRzW3N0YXJ0SW5kZXhdO1xuICAgICAgcGF0aHMucHVzaChuZXcgVXJsU2VnbWVudChwLnBhdGgsIHN0cmluZ2lmeShjb21tYW5kc1swXSkpKTtcbiAgICAgIGkrKztcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGNvbnN0IGN1cnIgPSBpc0NvbW1hbmRXaXRoT3V0bGV0cyhjb21tYW5kKSA/IGNvbW1hbmQub3V0bGV0c1tQUklNQVJZX09VVExFVF0gOiBgJHtjb21tYW5kfWA7XG4gICAgY29uc3QgbmV4dCA9IGkgPCBjb21tYW5kcy5sZW5ndGggLSAxID8gY29tbWFuZHNbaSArIDFdIDogbnVsbDtcbiAgICBpZiAoY3VyciAmJiBuZXh0ICYmIGlzTWF0cml4UGFyYW1zKG5leHQpKSB7XG4gICAgICBwYXRocy5wdXNoKG5ldyBVcmxTZWdtZW50KGN1cnIsIHN0cmluZ2lmeShuZXh0KSkpO1xuICAgICAgaSArPSAyO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXRocy5wdXNoKG5ldyBVcmxTZWdtZW50KGN1cnIsIHt9KSk7XG4gICAgICBpKys7XG4gICAgfVxuICB9XG4gIHJldHVybiBuZXcgVXJsU2VnbWVudEdyb3VwKHBhdGhzLCB7fSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU5ld1NlZ21lbnRDaGlsZHJlbihvdXRsZXRzOiB7W25hbWU6IHN0cmluZ106IHVua25vd25bXSB8IHN0cmluZ30pOiB7XG4gIFtvdXRsZXQ6IHN0cmluZ106IFVybFNlZ21lbnRHcm91cDtcbn0ge1xuICBjb25zdCBjaGlsZHJlbjoge1tvdXRsZXQ6IHN0cmluZ106IFVybFNlZ21lbnRHcm91cH0gPSB7fTtcbiAgT2JqZWN0LmVudHJpZXMob3V0bGV0cykuZm9yRWFjaCgoW291dGxldCwgY29tbWFuZHNdKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBjb21tYW5kcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbW1hbmRzID0gW2NvbW1hbmRzXTtcbiAgICB9XG4gICAgaWYgKGNvbW1hbmRzICE9PSBudWxsKSB7XG4gICAgICBjaGlsZHJlbltvdXRsZXRdID0gY3JlYXRlTmV3U2VnbWVudEdyb3VwKG5ldyBVcmxTZWdtZW50R3JvdXAoW10sIHt9KSwgMCwgY29tbWFuZHMpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBjaGlsZHJlbjtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5KHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0pOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSB7XG4gIGNvbnN0IHJlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgT2JqZWN0LmVudHJpZXMocGFyYW1zKS5mb3JFYWNoKChbaywgdl0pID0+IChyZXNba10gPSBgJHt2fWApKTtcbiAgcmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gY29tcGFyZShwYXRoOiBzdHJpbmcsIHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0sIHNlZ21lbnQ6IFVybFNlZ21lbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIHBhdGggPT0gc2VnbWVudC5wYXRoICYmIHNoYWxsb3dFcXVhbChwYXJhbXMsIHNlZ21lbnQucGFyYW1ldGVycyk7XG59XG4iXX0=
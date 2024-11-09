/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlX3VybF90cmVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9jcmVhdGVfdXJsX3RyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGFBQWEsSUFBSSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFJNUQsT0FBTyxFQUFTLGNBQWMsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNoRCxPQUFPLEVBQUMsVUFBVSxFQUFFLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ2hHLE9BQU8sRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0RHO0FBQ0gsTUFBTSxVQUFVLHlCQUF5QixDQUN2QyxVQUFrQyxFQUNsQyxRQUFlLEVBQ2YsY0FBNkIsSUFBSSxFQUNqQyxXQUEwQixJQUFJO0lBRTlCLE1BQU0seUJBQXlCLEdBQUcsMkJBQTJCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDMUUsT0FBTyw2QkFBNkIsQ0FBQyx5QkFBeUIsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ25HLENBQUM7QUFFRCxNQUFNLFVBQVUsMkJBQTJCLENBQUMsS0FBNkI7SUFDdkUsSUFBSSxXQUF3QyxDQUFDO0lBRTdDLFNBQVMsb0NBQW9DLENBQzNDLFlBQW9DO1FBRXBDLE1BQU0sWUFBWSxHQUF3QyxFQUFFLENBQUM7UUFDN0QsS0FBSyxNQUFNLGFBQWEsSUFBSSxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbEQsTUFBTSxJQUFJLEdBQUcsb0NBQW9DLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDakUsWUFBWSxDQUFDLGFBQWEs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RUQsU0FBUyxTQUFTLENBQUMsTUFBNEI7SUFDN0MsTUFBTSxHQUFHLEdBQTRCLEVBQUUsQ0FBQztJQUN4QyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM5RCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFFRCxTQUFTLE9BQU8sQ0FBQyxJQUFZLEVBQUUsTUFBNEIsRUFBRSxPQUFtQjtJQUM5RSxPQUFPLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLFlBQVksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHvJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7QWN0aXZhdGVkUm91dGVTbmFwc2hvdH0gZnJvbSAnLi9yb3V0ZXJfc3RhdGUnO1xuaW1wb3J0IHtQYXJhbXMsIFBSSU1BUllfT1VUTEVUfSBmcm9tICcuL3NoYXJlZCc7XG5pbXBvcnQge2NyZWF0ZVJvb3QsIHNxdWFzaFNlZ21lbnRHcm91cCwgVXJsU2VnbWVudCwgVXJsU2VnbWVudEdyb3VwLCBVcmxUcmVlfSBmcm9tICcuL3VybF90cmVlJztcbmltcG9ydCB7bGFzdCwgc2hhbGxvd0VxdWFsfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24nO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBgVXJsVHJlZWAgcmVsYXRpdmUgdG8gYW4gYEFjdGl2YXRlZFJvdXRlU25hcHNob3RgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKlxuICogQHBhcmFtIHJlbGF0aXZlVG8gVGhlIGBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90YCB0byBhcHBseSB0aGUgY29tbWFuZHMgdG9cbiAqIEBwYXJhbSBjb21tYW5kcyBBbiBhcnJheSBvZiBVUkwgZnJhZ21lbnRzIHdpdGggd2hpY2ggdG8gY29uc3RydWN0IHRoZSBuZXcgVVJMIHRyZWUuXG4gKiBJZiB0aGUgcGF0aCBpcyBzdGF0aWMsIGNhbiBiZSB0aGUgbGl0ZXJhbCBVUkwgc3RyaW5nLiBGb3IgYSBkeW5hbWljIHBhdGgsIHBhc3MgYW4gYXJyYXkgb2YgcGF0aFxuICogc2VnbWVudHMsIGZvbGxvd2VkIGJ5IHRoZSBwYXJhbWV0ZXJzIGZvciBlYWNoIHNlZ21lbnQuXG4gKiBUaGUgZnJhZ21lbnRzIGFyZSBhcHBsaWVkIHRvIHRoZSBvbmUgcHJvdmlkZWQgaW4gdGhlIGByZWxhdGl2ZVRvYCBwYXJhbWV0ZXIuXG4gKiBAcGFyYW0gcXVlcnlQYXJhbXMgVGhlIHF1ZXJ5IHBhcmFtZXRlcnMgZm9yIHRoZSBgVXJsVHJlZWAuIGBudWxsYCBpZiB0aGUgYFVybFRyZWVgIGRvZXMgbm90IGhhdmVcbiAqICAgICBhbnkgcXVlcnkgcGFyYW1ldGVycy5cbiAqIEBwYXJhbSBmcmFnbWVudCBUaGUgZnJhZ21lbnQgZm9yIHRoZSBgVXJsVHJlZWAuIGBudWxsYCBpZiB0aGUgYFVybFRyZWVgIGRvZXMgbm90IGhhdmUgYSBmcmFnbWVudC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIGBgYFxuICogLy8gY3JlYXRlIC90ZWFtLzMzL3VzZXIvMTFcbiAqIGNyZWF0ZVVybFRyZWVGcm9tU25hcHNob3Qoc25hcHNob3QsIFsnL3RlYW0nLCAzMywgJ3VzZXInLCAxMV0pO1xuICpcbiAqIC8vIGNyZWF0ZSAvdGVhbS8zMztleHBhbmQ9dHJ1ZS91c2VyLzExXG4gKiBjcmVhdGVVcmxUcmVlRnJvbVNuYXBzaG90KHNuYXBzaG90LCBbJy90ZWFtJywgMzMsIHtleHBhbmQ6IHRydWV9LCAndXNlcicsIDExXSk7XG4gKlxuICogLy8geW91IGNhbiBjb2xsYXBzZSBzdGF0aWMgc2VnbWVudHMgbGlrZSB0aGlzICh0aGlzIHdvcmtzIG9ubHkgd2l0aCB0aGUgZmlyc3QgcGFzc2VkLWluIHZhbHVlKTpcbiAqIGNyZWF0ZVVybFRyZWVGcm9tU25hcHNob3Qoc25hcHNob3QsIFsnL3RlYW0vMzMvdXNlcicsIHVzZXJJZF0pO1xuICpcbiAqIC8vIElmIHRoZSBmaXJzdCBzZWdtZW50IGNhbiBjb250YWluIHNsYXNoZXMsIGFuZCB5b3UgZG8gbm90IHdhbnQgdGhlIHJvdXRlciB0byBzcGxpdCBpdCxcbiAqIC8vIHlvdSBjYW4gZG8gdGhlIGZvbGxvd2luZzpcbiAqIGNyZWF0ZVVybFRyZWVGcm9tU25hcHNob3Qoc25hcHNob3QsIFt7c2VnbWVudFBhdGg6ICcvb25lL3R3byd9XSk7XG4gKlxuICogLy8gY3JlYXRlIC90ZWFtLzMzLyh1c2VyLzExLy9yaWdodDpjaGF0KVxuICogY3JlYXRlVXJsVHJlZUZyb21TbmFwc2hvdChzbmFwc2hvdCwgWycvdGVhbScsIDMzLCB7b3V0bGV0czoge3ByaW1hcnk6ICd1c2VyLzExJywgcmlnaHQ6XG4gKiAnY2hhdCd9fV0sIG51bGwsIG51bGwpO1xuICpcbiAqIC8vIHJlbW92ZSB0aGUgcmlnaHQgc2Vjb25kYXJ5IG5vZGVcbiAqIGNyZWF0ZVVybFRyZWVGcm9tU25hcHNob3Qoc25hcHNob3QsIFsnL3RlYW0nLCAzMywge291dGxldHM6IHtwcmltYXJ5OiAndXNlci8xMScsIHJpZ2h0OiBudWxsfX1dKTtcbiAqXG4gKiAvLyBGb3IgdGhlIGV4YW1wbGVzIGJlbG93LCBhc3N1bWUgdGhlIGN1cnJlbnQgVVJMIGlzIGZvciB0aGUgYC90ZWFtLzMzL3VzZXIvMTFgIGFuZCB0aGVcbiAqIGBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90YCBwb2ludHMgdG8gYHVzZXIvMTFgOlxuICpcbiAqIC8vIG5hdmlnYXRlIHRvIC90ZWFtLzMzL3VzZXIvMTEvZGV0YWlsc1xuICogY3JlYXRlVXJsVHJlZUZyb21TbmFwc2hvdChzbmFwc2hvdCwgWydkZXRhaWxzJ10pO1xuICpcbiAqIC8vIG5hdmlnYXRlIHRvIC90ZWFtLzMzL3VzZXIvMjJcbiAqIGNyZWF0ZVVybFRyZWVGcm9tU25hcHNob3Qoc25hcHNob3QsIFsnLi4vMjInXSk7XG4gKlxuICogLy8gbmF2aWdhdGUgdG8gL3RlYW0vNDQvdXNlci8yMlxuICogY3JlYXRlVXJsVHJlZUZyb21TbmFwc2hvdChzbmFwc2hvdCwgWycuLi8uLi90ZWFtLzQ0L3VzZXIvMjInXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVVybFRyZWVGcm9tU25hcHNob3QoXG4gIHJlbGF0aXZlVG86IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsXG4gIGNvbW1hbmRzOiBhbnlbXSxcbiAgcXVlcnlQYXJhbXM6IFBhcmFtcyB8IG51bGwgPSBudWxsLFxuICBmcmFnbWVudDogc3RyaW5nIHwgbnVsbCA9IG51bGwsXG4pOiBVcmxUcmVlIHtcbiAgY29uc3QgcmVsYXRpdmVUb1VybFNlZ21lbnRHcm91cCA9IGNyZWF0ZVNlZ21lbnRHcm91cEZyb21Sb3V0ZShyZWxhdGl2ZVRvKTtcbiAgcmV0dXJuIGNyZWF0ZVVybFRyZWVGcm9tU2VnbWVudEdyb3VwKHJlbGF0aXZlVG9VcmxTZWdtZW50R3JvdXAsIGNvbW1hbmRzLCBxdWVyeVBhcmFtcywgZnJhZ21lbnQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2VnbWVudEdyb3VwRnJvbVJvdXRlKHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KTogVXJsU2VnbWVudEdyb3VwIHtcbiAgbGV0IHRhcmdldEdyb3VwOiBVcmxTZWdtZW50R3JvdXAgfCB1bmRlZmluZWQ7XG5cbiAgZnVuY3Rpb24gY3JlYXRlU2VnbWVudEdyb3VwRnJvbVJvdXRlUmVjdXJzaXZlKFxuICAgIGN1cnJlbnRSb3V0ZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCxcbiAgKTogVXJsU2VnbWVudEdyb3VwIHtcbiAgICBjb25zdCBjaGlsZE91dGxldHM6IHtbb3V0bGV0OiBzdHJpbmddOiBVcmxTZWdtZW50R3JvdXB9ID0ge307XG4gICAgZm9yIChjb25zdCBjaGlsZFNuYXBzaG90IG9mIGN1cnJlbnRSb3V0ZS5jaGlsZHJlbikge1xuICAgICAgY29uc3Qgcm9vdCA9IGNyZWF0ZVNlZ21lbnRHcm91cEZyb21Sb3V0ZVJlY3Vyc2l2ZShjaGlsZFNuYXBzaG90KTtcbiAgICAgIGNoaWxkT3V0bGV0c1tjaGlsZFNuYXBzaG90Lm91dGxldF0gPSByb290O1xuICAgIH1cbiAgICBjb25zdCBzZWdtZW50R3JvdXAgPSBuZXcgVXJsU2VnbWVudEdyb3VwKGN1cnJlbnRSb3V0ZS51cmwsIGNoaWxkT3V0bGV0cyk7XG4gICAgaWYgKGN1cnJlbnRSb3V0ZSA9PT0gcm91dGUpIHtcbiAgICAgIHRhcmdldEdyb3VwID0gc2VnbWVudEdyb3VwO1xuICAgIH1cbiAgICByZXR1cm4gc2VnbWVudEdyb3VwO1xuICB9XG4gIGNvbnN0IHJvb3RDYW5kaWRhdGUgPSBjcmVhdGVTZWdtZW50R3JvdXBGcm9tUm91dGVSZWN1cnNpdmUocm91dGUucm9vdCk7XG4gIGNvbnN0IHJvb3RTZWdtZW50R3JvdXAgPSBjcmVhdGVSb290KHJvb3RDYW5kaWRhdGUpO1xuXG4gIHJldHVybiB0YXJnZXRHcm91cCA/PyByb290U2VnbWVudEdyb3VwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVXJsVHJlZUZyb21TZWdtZW50R3JvdXAoXG4gIHJlbGF0aXZlVG86IFVybFNlZ21lbnRHcm91cCxcbiAgY29tbWFuZHM6IGFueVtdLFxuICBxdWVyeVBhcmFtczogUGFyYW1zIHwgbnVsbCxcbiAgZnJhZ21lbnQ6IHN0cmluZyB8IG51bGwsXG4pOiBVcmxUcmVlIHtcbiAgbGV0IHJvb3QgPSByZWxhdGl2ZVRvO1xuICB3aGlsZSAocm9vdC5wYXJlbnQpIHtcbiAgICByb290ID0gcm9vdC5wYXJlbnQ7XG4gIH1cbiAgLy8gVGhlcmUgYXJlIG5vIGNvbW1hbmRzIHNvIHRoZSBgVXJsVHJlZWAgZ29lcyB0byB0aGUgc2FtZSBwYXRoIGFzIHRoZSBvbmUgY3JlYXRlZCBmcm9tIHRoZVxuICAvLyBgVXJsU2VnbWVudEdyb3VwYC4gQWxsIHdlIG5lZWQgdG8gZG8gaXMgdXBkYXRlIHRoZSBgcXVlcnlQYXJhbXNgIGFuZCBgZnJhZ21lbnRgIHdpdGhvdXRcbiAgLy8gYXBwbHlpbmcgYW55IG90aGVyIGxvZ2ljLlxuICBpZiAoY29tbWFuZHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRyZWUocm9vdCwgcm9vdCwgcm9vdCwgcXVlcnlQYXJhbXMsIGZyYWdtZW50KTtcbiAgfVxuXG4gIGNvbnN0IG5hdiA9IGNvbXB1dGVOYXZpZ2F0aW9uKGNvbW1hbmRzKTtcblxuICBpZiAobmF2LnRvUm9vdCgpKSB7XG4gICAgcmV0dXJuIHRyZWUocm9vdCwgcm9vdCwgbmV3IFVybFNlZ21lbnRHcm91cChbXSwge30pLCBxdWVyeVBhcmFtcywgZnJhZ21lbnQpO1xuICB9XG5cbiAgY29uc3QgcG9zaXRpb24gPSBmaW5kU3RhcnRpbmdQb3NpdGlvbkZvclRhcmdldEdyb3VwKG5hdiwgcm9vdCwgcmVsYXRpdmVUbyk7XG4gIGNvbnN0IG5ld1NlZ21lbnRHcm91cCA9IHBvc2l0aW9uLnByb2Nlc3NDaGlsZHJlblxuICAgID8gdXBkYXRlU2VnbWVudEdyb3VwQ2hpbGRyZW4ocG9zaXRpb24uc2VnbWVudEdyb3VwLCBwb3NpdGlvbi5pbmRleCwgbmF2LmNvbW1hbmRzKVxuICAgIDogdXBkYXRlU2VnbWVudEdyb3VwKHBvc2l0aW9uLnNlZ21lbnRHcm91cCwgcG9zaXRpb24uaW5kZXgsIG5hdi5jb21tYW5kcyk7XG4gIHJldHVybiB0cmVlKHJvb3QsIHBvc2l0aW9uLnNlZ21lbnRHcm91cCwgbmV3U2VnbWVudEdyb3VwLCBxdWVyeVBhcmFtcywgZnJhZ21lbnQpO1xufVxuXG5mdW5jdGlvbiBpc01hdHJpeFBhcmFtcyhjb21tYW5kOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBjb21tYW5kID09PSAnb2JqZWN0JyAmJiBjb21tYW5kICE9IG51bGwgJiYgIWNvbW1hbmQub3V0bGV0cyAmJiAhY29tbWFuZC5zZWdtZW50UGF0aDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIGEgZ2l2ZW4gY29tbWFuZCBoYXMgYW4gYG91dGxldHNgIG1hcC4gV2hlbiB3ZSBlbmNvdW50ZXIgYSBjb21tYW5kXG4gKiB3aXRoIGFuIG91dGxldHMgay92IG1hcCwgd2UgbmVlZCB0byBhcHBseSBlYWNoIG91dGxldCBpbmRpdmlkdWFsbHkgdG8gdGhlIGV4aXN0aW5nIHNlZ21lbnQuXG4gKi9cbmZ1bmN0aW9uIGlzQ29tbWFuZFdpdGhPdXRsZXRzKGNvbW1hbmQ6IGFueSk6IGNvbW1hbmQgaXMge291dGxldHM6IHtba2V5OiBzdHJpbmddOiBhbnl9fSB7XG4gIHJldHVybiB0eXBlb2YgY29tbWFuZCA9PT0gJ29iamVjdCcgJiYgY29tbWFuZCAhPSBudWxsICYmIGNvbW1hbmQub3V0bGV0cztcbn1cblxuZnVuY3Rpb24gdHJlZShcbiAgb2xkUm9vdDogVXJsU2VnbWVudEdyb3VwLFxuICBvbGRTZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCxcbiAgbmV3U2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsXG4gIHF1ZXJ5UGFyYW1zOiBQYXJhbXMgfCBudWxsLFxuICBmcmFnbWVudDogc3RyaW5nIHwgbnVsbCxcbik6IFVybFRyZWUge1xuICBsZXQgcXA6IGFueSA9IHt9O1xuICBpZiAocXVlcnlQYXJhbXMpIHtcbiAgICBPYmplY3QuZW50cmllcyhxdWVyeVBhcmFtcykuZm9yRWFjaCgoW25hbWUsIHZhbHVlXSkgPT4ge1xuICAgICAgcXBbbmFtZV0gPSBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlLm1hcCgodjogYW55KSA9PiBgJHt2fWApIDogYCR7dmFsdWV9YDtcbiAgICB9KTtcbiAgfVxuXG4gIGxldCByb290Q2FuZGlkYXRlOiBVcmxTZWdtZW50R3JvdXA7XG4gIGlmIChvbGRSb290ID09PSBvbGRTZWdtZW50R3JvdXApIHtcbiAgICByb290Q2FuZGlkYXRlID0gbmV3U2VnbWVudEdyb3VwO1xuICB9IGVsc2Uge1xuICAgIHJvb3RDYW5kaWRhdGUgPSByZXBsYWNlU2VnbWVudChvbGRSb290LCBvbGRTZWdtZW50R3JvdXAsIG5ld1NlZ21lbnRHcm91cCk7XG4gIH1cblxuICBjb25zdCBuZXdSb290ID0gY3JlYXRlUm9vdChzcXVhc2hTZWdtZW50R3JvdXAocm9vdENhbmRpZGF0ZSkpO1xuICByZXR1cm4gbmV3IFVybFRyZWUobmV3Um9vdCwgcXAsIGZyYWdtZW50KTtcbn1cblxuLyoqXG4gKiBSZXBsYWNlcyB0aGUgYG9sZFNlZ21lbnRgIHdoaWNoIGlzIGxvY2F0ZWQgaW4gc29tZSBjaGlsZCBvZiB0aGUgYGN1cnJlbnRgIHdpdGggdGhlIGBuZXdTZWdtZW50YC5cbiAqIFRoaXMgYWxzbyBoYXMgdGhlIGVmZmVjdCBvZiBjcmVhdGluZyBuZXcgYFVybFNlZ21lbnRHcm91cGAgY29waWVzIHRvIHVwZGF0ZSByZWZlcmVuY2VzLiBUaGlzXG4gKiBzaG91bGRuJ3QgYmUgbmVjZXNzYXJ5IGJ1dCB0aGUgZmFsbGJhY2sgbG9naWMgZm9yIGFuIGludmFsaWQgQWN0aXZhdGVkUm91dGUgaW4gdGhlIGNyZWF0aW9uIHVzZXNcbiAqIHRoZSBSb3V0ZXIncyBjdXJyZW50IHVybCB0cmVlLiBJZiB3ZSBkb24ndCBjcmVhdGUgbmV3IHNlZ21lbnQgZ3JvdXBzLCB3ZSBlbmQgdXAgbW9kaWZ5aW5nIHRoYXRcbiAqIHZhbHVlLlxuICovXG5mdW5jdGlvbiByZXBsYWNlU2VnbWVudChcbiAgY3VycmVudDogVXJsU2VnbWVudEdyb3VwLFxuICBvbGRTZWdtZW50OiBVcmxTZWdtZW50R3JvdXAsXG4gIG5ld1NlZ21lbnQ6IFVybFNlZ21lbnRHcm91cCxcbik6IFVybFNlZ21lbnRHcm91cCB7XG4gIGNvbnN0IGNoaWxkcmVuOiB7W2tleTogc3RyaW5nXTogVXJsU2VnbWVudEdyb3VwfSA9IHt9O1xuICBPYmplY3QuZW50cmllcyhjdXJyZW50LmNoaWxkcmVuKS5mb3JFYWNoKChbb3V0bGV0TmFtZSwgY10pID0+IHtcbiAgICBpZiAoYyA9PT0gb2xkU2VnbWVudCkge1xuICAgICAgY2hpbGRyZW5bb3V0bGV0TmFtZV0gPSBuZXdTZWdtZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGlsZHJlbltvdXRsZXROYW1lXSA9IHJlcGxhY2VTZWdtZW50KGMsIG9sZFNlZ21lbnQsIG5ld1NlZ21lbnQpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBuZXcgVXJsU2VnbWVudEdyb3VwKGN1cnJlbnQuc2VnbWVudHMsIGNoaWxkcmVuKTtcbn1cblxuY2xhc3MgTmF2aWdhdGlvbiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBpc0Fic29sdXRlOiBib29sZWFuLFxuICAgIHB1YmxpYyBudW1iZXJPZkRvdWJsZURvdHM6IG51bWJlcixcbiAgICBwdWJsaWMgY29tbWFuZHM6IGFueVtdLFxuICApIHtcbiAgICBpZiAoaXNBYnNvbHV0ZSAmJiBjb21tYW5kcy5sZW5ndGggPiAwICYmIGlzTWF0cml4UGFyYW1zKGNvbW1hbmRzWzBdKSkge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5ST09UX1NFR01FTlRfTUFUUklYX1BBUkFNUyxcbiAgICAgICAgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiZcbiAgICAgICAgICAnUm9vdCBzZWdtZW50IGNhbm5vdCBoYXZlIG1hdHJpeCBwYXJhbWV0ZXJzJyxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgY21kV2l0aE91dGxldCA9IGNvbW1hbmRzLmZpbmQoaXNDb21tYW5kV2l0aE91dGxldHMpO1xuICAgIGlmIChjbWRXaXRoT3V0bGV0ICYmIGNtZFdpdGhPdXRsZXQgIT09IGxhc3QoY29tbWFuZHMpKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1BMQUNFRF9PVVRMRVRTX0NPTU1BTkQsXG4gICAgICAgICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmXG4gICAgICAgICAgJ3tvdXRsZXRzOnt9fSBoYXMgdG8gYmUgdGhlIGxhc3QgY29tbWFuZCcsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyB0b1Jvb3QoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNBYnNvbHV0ZSAmJiB0aGlzLmNvbW1hbmRzLmxlbmd0aCA9PT0gMSAmJiB0aGlzLmNvbW1hbmRzWzBdID09ICcvJztcbiAgfVxufVxuXG4vKiogVHJhbnNmb3JtcyBjb21tYW5kcyB0byBhIG5vcm1hbGl6ZWQgYE5hdmlnYXRpb25gICovXG5mdW5jdGlvbiBjb21wdXRlTmF2aWdhdGlvbihjb21tYW5kczogYW55W10pOiBOYXZpZ2F0aW9uIHtcbiAgaWYgKHR5cGVvZiBjb21tYW5kc1swXSA9PT0gJ3N0cmluZycgJiYgY29tbWFuZHMubGVuZ3RoID09PSAxICYmIGNvbW1hbmRzWzBdID09PSAnLycpIHtcbiAgICByZXR1cm4gbmV3IE5hdmlnYXRpb24odHJ1ZSwgMCwgY29tbWFuZHMpO1xuICB9XG5cbiAgbGV0IG51bWJlck9mRG91YmxlRG90cyA9IDA7XG4gIGxldCBpc0Fic29sdXRlID0gZmFsc2U7XG5cbiAgY29uc3QgcmVzOiBhbnlbXSA9IGNvbW1hbmRzLnJlZHVjZSgocmVzLCBjbWQsIGNtZElkeCkgPT4ge1xuICAgIGlmICh0eXBlb2YgY21kID09PSAnb2JqZWN0JyAmJiBjbWQgIT0gbnVsbCkge1xuICAgICAgaWYgKGNtZC5vdXRsZXRzKSB7XG4gICAgICAgIGNvbnN0IG91dGxldHM6IHtbazogc3RyaW5nXTogYW55fSA9IHt9O1xuICAgICAgICBPYmplY3QuZW50cmllcyhjbWQub3V0bGV0cykuZm9yRWFjaCgoW25hbWUsIGNvbW1hbmRzXSkgPT4ge1xuICAgICAgICAgIG91dGxldHNbbmFtZV0gPSB0eXBlb2YgY29tbWFuZHMgPT09ICdzdHJpbmcnID8gY29tbWFuZHMuc3BsaXQoJy8nKSA6IGNvbW1hbmRzO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIFsuLi5yZXMsIHtvdXRsZXRzfV07XG4gICAgICB9XG5cbiAgICAgIGlmIChjbWQuc2VnbWVudFBhdGgpIHtcbiAgICAgICAgcmV0dXJuIFsuLi5yZXMsIGNtZC5zZWdtZW50UGF0aF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCEodHlwZW9mIGNtZCA9PT0gJ3N0cmluZycpKSB7XG4gICAgICByZXR1cm4gWy4uLnJlcywgY21kXTtcbiAgICB9XG5cbiAgICBpZiAoY21kSWR4ID09PSAwKSB7XG4gICAgICBjbWQuc3BsaXQoJy8nKS5mb3JFYWNoKCh1cmxQYXJ0LCBwYXJ0SW5kZXgpID0+IHtcbiAgICAgICAgaWYgKHBhcnRJbmRleCA9PSAwICYmIHVybFBhcnQgPT09ICcuJykge1xuICAgICAgICAgIC8vIHNraXAgJy4vYSdcbiAgICAgICAgfSBlbHNlIGlmIChwYXJ0SW5kZXggPT0gMCAmJiB1cmxQYXJ0ID09PSAnJykge1xuICAgICAgICAgIC8vICAnL2EnXG4gICAgICAgICAgaXNBYnNvbHV0ZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAodXJsUGFydCA9PT0gJy4uJykge1xuICAgICAgICAgIC8vICAnLi4vYSdcbiAgICAgICAgICBudW1iZXJPZkRvdWJsZURvdHMrKztcbiAgICAgICAgfSBlbHNlIGlmICh1cmxQYXJ0ICE9ICcnKSB7XG4gICAgICAgICAgcmVzLnB1c2godXJsUGFydCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIHJldHVybiBbLi4ucmVzLCBjbWRdO1xuICB9LCBbXSk7XG5cbiAgcmV0dXJuIG5ldyBOYXZpZ2F0aW9uKGlzQWJzb2x1dGUsIG51bWJlck9mRG91YmxlRG90cywgcmVzKTtcbn1cblxuY2xhc3MgUG9zaXRpb24ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsXG4gICAgcHVibGljIHByb2Nlc3NDaGlsZHJlbjogYm9vbGVhbixcbiAgICBwdWJsaWMgaW5kZXg6IG51bWJlcixcbiAgKSB7fVxufVxuXG5mdW5jdGlvbiBmaW5kU3RhcnRpbmdQb3NpdGlvbkZvclRhcmdldEdyb3VwKFxuICBuYXY6IE5hdmlnYXRpb24sXG4gIHJvb3Q6IFVybFNlZ21lbnRHcm91cCxcbiAgdGFyZ2V0OiBVcmxTZWdtZW50R3JvdXAsXG4pOiBQb3NpdGlvbiB7XG4gIGlmIChuYXYuaXNBYnNvbHV0ZSkge1xuICAgIHJldHVybiBuZXcgUG9zaXRpb24ocm9vdCwgdHJ1ZSwgMCk7XG4gIH1cblxuICBpZiAoIXRhcmdldCkge1xuICAgIC8vIGBOYU5gIGlzIHVzZWQgb25seSB0byBtYWludGFpbiBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSB3aXRoIGluY29ycmVjdGx5IG1vY2tlZFxuICAgIC8vIGBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90YCBpbiB0ZXN0cy4gSW4gcHJpb3IgdmVyc2lvbnMgb2YgdGhpcyBjb2RlLCB0aGUgcG9zaXRpb24gaGVyZSB3YXNcbiAgICAvLyBkZXRlcm1pbmVkIGJhc2VkIG9uIGFuIGludGVybmFsIHByb3BlcnR5IHRoYXQgd2FzIHJhcmVseSBtb2NrZWQsIHJlc3VsdGluZyBpbiBgTmFOYC4gSW5cbiAgICAvLyByZWFsaXR5LCB0aGlzIGNvZGUgcGF0aCBzaG91bGQgX25ldmVyXyBiZSB0b3VjaGVkIHNpbmNlIGB0YXJnZXRgIGlzIG5vdCBhbGxvd2VkIHRvIGJlIGZhbHNleS5cbiAgICByZXR1cm4gbmV3IFBvc2l0aW9uKHJvb3QsIGZhbHNlLCBOYU4pO1xuICB9XG4gIGlmICh0YXJnZXQucGFyZW50ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG5ldyBQb3NpdGlvbih0YXJnZXQsIHRydWUsIDApO1xuICB9XG5cbiAgY29uc3QgbW9kaWZpZXIgPSBpc01hdHJpeFBhcmFtcyhuYXYuY29tbWFuZHNbMF0pID8gMCA6IDE7XG4gIGNvbnN0IGluZGV4ID0gdGFyZ2V0LnNlZ21lbnRzLmxlbmd0aCAtIDEgKyBtb2RpZmllcjtcbiAgcmV0dXJuIGNyZWF0ZVBvc2l0aW9uQXBwbHlpbmdEb3VibGVEb3RzKHRhcmdldCwgaW5kZXgsIG5hdi5udW1iZXJPZkRvdWJsZURvdHMpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQb3NpdGlvbkFwcGx5aW5nRG91YmxlRG90cyhcbiAgZ3JvdXA6IFVybFNlZ21lbnRHcm91cCxcbiAgaW5kZXg6IG51bWJlcixcbiAgbnVtYmVyT2ZEb3VibGVEb3RzOiBudW1iZXIsXG4pOiBQb3NpdGlvbiB7XG4gIGxldCBnID0gZ3JvdXA7XG4gIGxldCBjaSA9IGluZGV4O1xuICBsZXQgZGQgPSBudW1iZXJPZkRvdWJsZURvdHM7XG4gIHdoaWxlIChkZCA+IGNpKSB7XG4gICAgZGQgLT0gY2k7XG4gICAgZyA9IGcucGFyZW50ITtcbiAgICBpZiAoIWcpIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9ET1VCTEVfRE9UUyxcbiAgICAgICAgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiYgXCJJbnZhbGlkIG51bWJlciBvZiAnLi4vJ1wiLFxuICAgICAgKTtcbiAgICB9XG4gICAgY2kgPSBnLnNlZ21lbnRzLmxlbmd0aDtcbiAgfVxuICByZXR1cm4gbmV3IFBvc2l0aW9uKGcsIGZhbHNlLCBjaSAtIGRkKTtcbn1cblxuZnVuY3Rpb24gZ2V0T3V0bGV0cyhjb21tYW5kczogdW5rbm93bltdKToge1trOiBzdHJpbmddOiB1bmtub3duW10gfCBzdHJpbmd9IHtcbiAgaWYgKGlzQ29tbWFuZFdpdGhPdXRsZXRzKGNvbW1hbmRzWzBdKSkge1xuICAgIHJldHVybiBjb21tYW5kc1swXS5vdXRsZXRzO1xuICB9XG5cbiAgcmV0dXJuIHtbUFJJTUFSWV9PVVRMRVRdOiBjb21tYW5kc307XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVNlZ21lbnRHcm91cChcbiAgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAgfCB1bmRlZmluZWQsXG4gIHN0YXJ0SW5kZXg6IG51bWJlcixcbiAgY29tbWFuZHM6IGFueVtdLFxuKTogVXJsU2VnbWVudEdyb3VwIHtcbiAgc2VnbWVudEdyb3VwID8/PSBuZXcgVXJsU2VnbWVudEdyb3VwKFtdLCB7fSk7XG4gIGlmIChzZWdtZW50R3JvdXAuc2VnbWVudHMubGVuZ3RoID09PSAwICYmIHNlZ21lbnRHcm91cC5oYXNDaGlsZHJlbigpKSB7XG4gICAgcmV0dXJuIHVwZGF0ZVNlZ21lbnRHcm91cENoaWxkcmVuKHNlZ21lbnRHcm91cCwgc3RhcnRJbmRleCwgY29tbWFuZHMpO1xuICB9XG5cbiAgY29uc3QgbSA9IHByZWZpeGVkV2l0aChzZWdtZW50R3JvdXAsIHN0YXJ0SW5kZXgsIGNvbW1hbmRzKTtcbiAgY29uc3Qgc2xpY2VkQ29tbWFuZHMgPSBjb21tYW5kcy5zbGljZShtLmNvbW1hbmRJbmRleCk7XG4gIGlmIChtLm1hdGNoICYmIG0ucGF0aEluZGV4IDwgc2VnbWVudEdyb3VwLnNlZ21lbnRzLmxlbmd0aCkge1xuICAgIGNvbnN0IGcgPSBuZXcgVXJsU2VnbWVudEdyb3VwKHNlZ21lbnRHcm91cC5zZWdtZW50cy5zbGljZSgwLCBtLnBhdGhJbmRleCksIHt9KTtcbiAgICBnLmNoaWxkcmVuW1BSSU1BUllfT1VUTEVUXSA9IG5ldyBVcmxTZWdtZW50R3JvdXAoXG4gICAgICBzZWdtZW50R3JvdXAuc2VnbWVudHMuc2xpY2UobS5wYXRoSW5kZXgpLFxuICAgICAgc2VnbWVudEdyb3VwLmNoaWxkcmVuLFxuICAgICk7XG4gICAgcmV0dXJuIHVwZGF0ZVNlZ21lbnRHcm91cENoaWxkcmVuKGcsIDAsIHNsaWNlZENvbW1hbmRzKTtcbiAgfSBlbHNlIGlmIChtLm1hdGNoICYmIHNsaWNlZENvbW1hbmRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBuZXcgVXJsU2VnbWVudEdyb3VwKHNlZ21lbnRHcm91cC5zZWdtZW50cywge30pO1xuICB9IGVsc2UgaWYgKG0ubWF0Y2ggJiYgIXNlZ21lbnRHcm91cC5oYXNDaGlsZHJlbigpKSB7XG4gICAgcmV0dXJuIGNyZWF0ZU5ld1NlZ21lbnRHcm91cChzZWdtZW50R3JvdXAsIHN0YXJ0SW5kZXgsIGNvbW1hbmRzKTtcbiAgfSBlbHNlIGlmIChtLm1hdGNoKSB7XG4gICAgcmV0dXJuIHVwZGF0ZVNlZ21lbnRHcm91cENoaWxkcmVuKHNlZ21lbnRHcm91cCwgMCwgc2xpY2VkQ29tbWFuZHMpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjcmVhdGVOZXdTZWdtZW50R3JvdXAoc2VnbWVudEdyb3VwLCBzdGFydEluZGV4LCBjb21tYW5kcyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlU2VnbWVudEdyb3VwQ2hpbGRyZW4oXG4gIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLFxuICBzdGFydEluZGV4OiBudW1iZXIsXG4gIGNvbW1hbmRzOiBhbnlbXSxcbik6IFVybFNlZ21lbnRHcm91cCB7XG4gIGlmIChjb21tYW5kcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IFVybFNlZ21lbnRHcm91cChzZWdtZW50R3JvdXAuc2VnbWVudHMsIHt9KTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBvdXRsZXRzID0gZ2V0T3V0bGV0cyhjb21tYW5kcyk7XG4gICAgY29uc3QgY2hpbGRyZW46IHtba2V5OiBzdHJpbmddOiBVcmxTZWdtZW50R3JvdXB9ID0ge307XG4gICAgLy8gSWYgdGhlIHNldCBvZiBjb21tYW5kcyBhcHBsaWVzIHRvIGFueXRoaW5nIG90aGVyIHRoYW4gdGhlIHByaW1hcnkgb3V0bGV0IGFuZCB0aGUgY2hpbGRcbiAgICAvLyBzZWdtZW50IGlzIGFuIGVtcHR5IHBhdGggcHJpbWFyeSBzZWdtZW50IG9uIGl0cyBvd24sIHdlIHdhbnQgdG8gYXBwbHkgdGhlIGNvbW1hbmRzIHRvIHRoZVxuICAgIC8vIGVtcHR5IGNoaWxkIHBhdGggcmF0aGVyIHRoYW4gaGVyZS4gVGhlIG91dGNvbWUgaXMgdGhhdCB0aGUgZW1wdHkgcHJpbWFyeSBjaGlsZCBpcyBlZmZlY3RpdmVseVxuICAgIC8vIHJlbW92ZWQgZnJvbSB0aGUgZmluYWwgb3V0cHV0IFVybFRyZWUuIEltYWdpbmUgdGhlIGZvbGxvd2luZyBjb25maWc6XG4gICAgLy9cbiAgICAvLyB7cGF0aDogJycsIGNoaWxkcmVuOiBbe3BhdGg6ICcqKicsIG91dGxldDogJ3BvcHVwJ31dfS5cbiAgICAvL1xuICAgIC8vIE5hdmlnYXRpb24gdG8gLyhwb3B1cDphKSB3aWxsIGFjdGl2YXRlIHRoZSBjaGlsZCBvdXRsZXQgY29ycmVjdGx5IEdpdmVuIGEgZm9sbG93LXVwXG4gICAgLy8gbmF2aWdhdGlvbiB3aXRoIGNvbW1hbmRzXG4gICAgLy8gWycvJywge291dGxldHM6IHsncG9wdXAnOiAnYid9fV0sIHdlIF93b3VsZCBub3RfIHdhbnQgdG8gYXBwbHkgdGhlIG91dGxldCBjb21tYW5kcyB0byB0aGVcbiAgICAvLyByb290IHNlZ21lbnQgYmVjYXVzZSB0aGF0IHdvdWxkIHJlc3VsdCBpblxuICAgIC8vIC8vKHBvcHVwOmEpKHBvcHVwOmIpIHNpbmNlIHRoZSBvdXRsZXQgY29tbWFuZCBnb3QgYXBwbGllZCBvbmUgbGV2ZWwgYWJvdmUgd2hlcmUgaXQgYXBwZWFycyBpblxuICAgIC8vIHRoZSBgQWN0aXZhdGVkUm91dGVgIHJhdGhlciB0aGFuIHVwZGF0aW5nIHRoZSBleGlzdGluZyBvbmUuXG4gICAgLy9cbiAgICAvLyBCZWNhdXNlIGVtcHR5IHBhdGhzIGRvIG5vdCBhcHBlYXIgaW4gdGhlIFVSTCBzZWdtZW50cyBhbmQgdGhlIGZhY3QgdGhhdCB0aGUgc2VnbWVudHMgdXNlZCBpblxuICAgIC8vIHRoZSBvdXRwdXQgYFVybFRyZWVgIGFyZSBzcXVhc2hlZCB0byBlbGltaW5hdGUgdGhlc2UgZW1wdHkgcGF0aHMgd2hlcmUgcG9zc2libGVcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2Jsb2IvMTNmMTBkZTQwZTI1YzY5MDBjYTU1YmQ4M2IzNmJkNTMzZGFjZmE5ZS9wYWNrYWdlcy9yb3V0ZXIvc3JjL3VybF90cmVlLnRzI0w3NTVcbiAgICAvLyBpdCBjYW4gYmUgaGFyZCB0byBkZXRlcm1pbmUgd2hhdCBpcyB0aGUgcmlnaHQgdGhpbmcgdG8gZG8gd2hlbiBhcHBseWluZyBjb21tYW5kcyB0byBhXG4gICAgLy8gYFVybFNlZ21lbnRHcm91cGAgdGhhdCBpcyBjcmVhdGVkIGZyb20gYW4gXCJ1bnNxdWFzaGVkXCIvZXhwYW5kZWQgYEFjdGl2YXRlZFJvdXRlYCB0cmVlLlxuICAgIC8vIFRoaXMgY29kZSBlZmZlY3RpdmVseSBcInNxdWFzaGVzXCIgZW1wdHkgcGF0aCBwcmltYXJ5IHJvdXRlcyB3aGVuIHRoZXkgaGF2ZSBubyBzaWJsaW5ncyBvblxuICAgIC8vIHRoZSBzYW1lIGxldmVsIG9mIHRoZSB0cmVlLlxuICAgIGlmIChcbiAgICAgIE9iamVjdC5rZXlzKG91dGxldHMpLnNvbWUoKG8pID0+IG8gIT09IFBSSU1BUllfT1VUTEVUKSAmJlxuICAgICAgc2VnbWVudEdyb3VwLmNoaWxkcmVuW1BSSU1BUllfT1VUTEVUXSAmJlxuICAgICAgc2VnbWVudEdyb3VwLm51bWJlck9mQ2hpbGRyZW4gPT09IDEgJiZcbiAgICAgIHNlZ21lbnRHcm91cC5jaGlsZHJlbltQUklNQVJZX09VVExFVF0uc2VnbWVudHMubGVuZ3RoID09PSAwXG4gICAgKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbk9mRW1wdHlDaGlsZCA9IHVwZGF0ZVNlZ21lbnRHcm91cENoaWxkcmVuKFxuICAgICAgICBzZWdtZW50R3JvdXAuY2hpbGRyZW5bUFJJTUFSWV9PVVRMRVRdLFxuICAgICAgICBzdGFydEluZGV4LFxuICAgICAgICBjb21tYW5kcyxcbiAgICAgICk7XG4gICAgICByZXR1cm4gbmV3IFVybFNlZ21lbnRHcm91cChzZWdtZW50R3JvdXAuc2VnbWVudHMsIGNoaWxkcmVuT2ZFbXB0eUNoaWxkLmNoaWxkcmVuKTtcbiAgICB9XG5cbiAgICBPYmplY3QuZW50cmllcyhvdXRsZXRzKS5mb3JFYWNoKChbb3V0bGV0LCBjb21tYW5kc10pID0+IHtcbiAgICAgIGlmICh0eXBlb2YgY29tbWFuZHMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbW1hbmRzID0gW2NvbW1hbmRzXTtcbiAgICAgIH1cbiAgICAgIGlmIChjb21tYW5kcyAhPT0gbnVsbCkge1xuICAgICAgICBjaGlsZHJlbltvdXRsZXRdID0gdXBkYXRlU2VnbWVudEdyb3VwKHNlZ21lbnRHcm91cC5jaGlsZHJlbltvdXRsZXRdLCBzdGFydEluZGV4LCBjb21tYW5kcyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBPYmplY3QuZW50cmllcyhzZWdtZW50R3JvdXAuY2hpbGRyZW4pLmZvckVhY2goKFtjaGlsZE91dGxldCwgY2hpbGRdKSA9PiB7XG4gICAgICBpZiAob3V0bGV0c1tjaGlsZE91dGxldF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjaGlsZHJlbltjaGlsZE91dGxldF0gPSBjaGlsZDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbmV3IFVybFNlZ21lbnRHcm91cChzZWdtZW50R3JvdXAuc2VnbWVudHMsIGNoaWxkcmVuKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcmVmaXhlZFdpdGgoc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsIHN0YXJ0SW5kZXg6IG51bWJlciwgY29tbWFuZHM6IGFueVtdKSB7XG4gIGxldCBjdXJyZW50Q29tbWFuZEluZGV4ID0gMDtcbiAgbGV0IGN1cnJlbnRQYXRoSW5kZXggPSBzdGFydEluZGV4O1xuXG4gIGNvbnN0IG5vTWF0Y2ggPSB7bWF0Y2g6IGZhbHNlLCBwYXRoSW5kZXg6IDAsIGNvbW1hbmRJbmRleDogMH07XG4gIHdoaWxlIChjdXJyZW50UGF0aEluZGV4IDwgc2VnbWVudEdyb3VwLnNlZ21lbnRzLmxlbmd0aCkge1xuICAgIGlmIChjdXJyZW50Q29tbWFuZEluZGV4ID49IGNvbW1hbmRzLmxlbmd0aCkgcmV0dXJuIG5vTWF0Y2g7XG4gICAgY29uc3QgcGF0aCA9IHNlZ21lbnRHcm91cC5zZWdtZW50c1tjdXJyZW50UGF0aEluZGV4XTtcbiAgICBjb25zdCBjb21tYW5kID0gY29tbWFuZHNbY3VycmVudENvbW1hbmRJbmRleF07XG4gICAgLy8gRG8gbm90IHRyeSB0byBjb25zdW1lIGNvbW1hbmQgYXMgcGFydCBvZiB0aGUgcHJlZml4aW5nIGlmIGl0IGhhcyBvdXRsZXRzIGJlY2F1c2UgaXQgY2FuXG4gICAgLy8gY29udGFpbiBvdXRsZXRzIG90aGVyIHRoYW4gdGhlIG9uZSBiZWluZyBwcm9jZXNzZWQuIENvbnN1bWluZyB0aGUgb3V0bGV0cyBjb21tYW5kIHdvdWxkXG4gICAgLy8gcmVzdWx0IGluIG90aGVyIG91dGxldHMgYmVpbmcgaWdub3JlZC5cbiAgICBpZiAoaXNDb21tYW5kV2l0aE91dGxldHMoY29tbWFuZCkpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjb25zdCBjdXJyID0gYCR7Y29tbWFuZH1gO1xuICAgIGNvbnN0IG5leHQgPVxuICAgICAgY3VycmVudENvbW1hbmRJbmRleCA8IGNvbW1hbmRzLmxlbmd0aCAtIDEgPyBjb21tYW5kc1tjdXJyZW50Q29tbWFuZEluZGV4ICsgMV0gOiBudWxsO1xuXG4gICAgaWYgKGN1cnJlbnRQYXRoSW5kZXggPiAwICYmIGN1cnIgPT09IHVuZGVmaW5lZCkgYnJlYWs7XG5cbiAgICBpZiAoY3VyciAmJiBuZXh0ICYmIHR5cGVvZiBuZXh0ID09PSAnb2JqZWN0JyAmJiBuZXh0Lm91dGxldHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKCFjb21wYXJlKGN1cnIsIG5leHQsIHBhdGgpKSByZXR1cm4gbm9NYXRjaDtcbiAgICAgIGN1cnJlbnRDb21tYW5kSW5kZXggKz0gMjtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFjb21wYXJlKGN1cnIsIHt9LCBwYXRoKSkgcmV0dXJuIG5vTWF0Y2g7XG4gICAgICBjdXJyZW50Q29tbWFuZEluZGV4Kys7XG4gICAgfVxuICAgIGN1cnJlbnRQYXRoSW5kZXgrKztcbiAgfVxuXG4gIHJldHVybiB7bWF0Y2g6IHRydWUsIHBhdGhJbmRleDogY3VycmVudFBhdGhJbmRleCwgY29tbWFuZEluZGV4OiBjdXJyZW50Q29tbWFuZEluZGV4fTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTmV3U2VnbWVudEdyb3VwKFxuICBzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCxcbiAgc3RhcnRJbmRleDogbnVtYmVyLFxuICBjb21tYW5kczogYW55W10sXG4pOiBVcmxTZWdtZW50R3JvdXAge1xuICBjb25zdCBwYXRocyA9IHNlZ21lbnRHcm91cC5zZWdtZW50cy5zbGljZSgwLCBzdGFydEluZGV4KTtcblxuICBsZXQgaSA9IDA7XG4gIHdoaWxlIChpIDwgY29tbWFuZHMubGVuZ3RoKSB7XG4gICAgY29uc3QgY29tbWFuZCA9IGNvbW1hbmRzW2ldO1xuICAgIGlmIChpc0NvbW1hbmRXaXRoT3V0bGV0cyhjb21tYW5kKSkge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBjcmVhdGVOZXdTZWdtZW50Q2hpbGRyZW4oY29tbWFuZC5vdXRsZXRzKTtcbiAgICAgIHJldHVybiBuZXcgVXJsU2VnbWVudEdyb3VwKHBhdGhzLCBjaGlsZHJlbik7XG4gICAgfVxuXG4gICAgLy8gaWYgd2Ugc3RhcnQgd2l0aCBhbiBvYmplY3QgbGl0ZXJhbCwgd2UgbmVlZCB0byByZXVzZSB0aGUgcGF0aCBwYXJ0IGZyb20gdGhlIHNlZ21lbnRcbiAgICBpZiAoaSA9PT0gMCAmJiBpc01hdHJpeFBhcmFtcyhjb21tYW5kc1swXSkpIHtcbiAgICAgIGNvbnN0IHAgPSBzZWdtZW50R3JvdXAuc2VnbWVudHNbc3RhcnRJbmRleF07XG4gICAgICBwYXRocy5wdXNoKG5ldyBVcmxTZWdtZW50KHAucGF0aCwgc3RyaW5naWZ5KGNvbW1hbmRzWzBdKSkpO1xuICAgICAgaSsrO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3QgY3VyciA9IGlzQ29tbWFuZFdpdGhPdXRsZXRzKGNvbW1hbmQpID8gY29tbWFuZC5vdXRsZXRzW1BSSU1BUllfT1VUTEVUXSA6IGAke2NvbW1hbmR9YDtcbiAgICBjb25zdCBuZXh0ID0gaSA8IGNvbW1hbmRzLmxlbmd0aCAtIDEgPyBjb21tYW5kc1tpICsgMV0gOiBudWxsO1xuICAgIGlmIChjdXJyICYmIG5leHQgJiYgaXNNYXRyaXhQYXJhbXMobmV4dCkpIHtcbiAgICAgIHBhdGhzLnB1c2gobmV3IFVybFNlZ21lbnQoY3Vyciwgc3RyaW5naWZ5KG5leHQpKSk7XG4gICAgICBpICs9IDI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhdGhzLnB1c2gobmV3IFVybFNlZ21lbnQoY3Vyciwge30pKTtcbiAgICAgIGkrKztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5ldyBVcmxTZWdtZW50R3JvdXAocGF0aHMsIHt9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTmV3U2VnbWVudENoaWxkcmVuKG91dGxldHM6IHtbbmFtZTogc3RyaW5nXTogdW5rbm93bltdIHwgc3RyaW5nfSk6IHtcbiAgW291dGxldDogc3RyaW5nXTogVXJsU2VnbWVudEdyb3VwO1xufSB7XG4gIGNvbnN0IGNoaWxkcmVuOiB7W291dGxldDogc3RyaW5nXTogVXJsU2VnbWVudEdyb3VwfSA9IHt9O1xuICBPYmplY3QuZW50cmllcyhvdXRsZXRzKS5mb3JFYWNoKChbb3V0bGV0LCBjb21tYW5kc10pID0+IHtcbiAgICBpZiAodHlwZW9mIGNvbW1hbmRzID09PSAnc3RyaW5nJykge1xuICAgICAgY29tbWFuZHMgPSBbY29tbWFuZHNdO1xuICAgIH1cbiAgICBpZiAoY29tbWFuZHMgIT09IG51bGwpIHtcbiAgICAgIGNoaWxkcmVuW291dGxldF0gPSBjcmVhdGVOZXdTZWdtZW50R3JvdXAobmV3IFVybFNlZ21lbnRHcm91cChbXSwge30pLCAwLCBjb21tYW5kcyk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGNoaWxkcmVuO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnkocGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSk6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9IHtcbiAgY29uc3QgcmVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICBPYmplY3QuZW50cmllcyhwYXJhbXMpLmZvckVhY2goKFtrLCB2XSkgPT4gKHJlc1trXSA9IGAke3Z9YCkpO1xuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBjb21wYXJlKHBhdGg6IHN0cmluZywgcGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSwgc2VnbWVudDogVXJsU2VnbWVudCk6IGJvb2xlYW4ge1xuICByZXR1cm4gcGF0aCA9PSBzZWdtZW50LnBhdGggJiYgc2hhbGxvd0VxdWFsKHBhcmFtcywgc2VnbWVudC5wYXJhbWV0ZXJzKTtcbn1cbiJdfQ==
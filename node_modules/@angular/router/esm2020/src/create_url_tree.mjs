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
import { forEach, last, shallowEqual } from './utils/collection';
const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;
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
    const newSegmentGroup = position.processChildren ?
        updateSegmentGroupChildren(position.segmentGroup, position.index, nav.commands) :
        updateSegmentGroup(position.segmentGroup, position.index, nav.commands);
    return tree(root, position.segmentGroup, newSegmentGroup, queryParams, fragment);
}
export function createUrlTree(route, urlTree, commands, queryParams, fragment) {
    if (commands.length === 0) {
        return tree(urlTree.root, urlTree.root, urlTree.root, queryParams, fragment);
    }
    const nav = computeNavigation(commands);
    if (nav.toRoot()) {
        return tree(urlTree.root, urlTree.root, new UrlSegmentGroup([], {}), queryParams, fragment);
    }
    function createTreeUsingPathIndex(lastPathIndex) {
        const startingPosition = findStartingPosition(nav, urlTree, route.snapshot?._urlSegment, lastPathIndex);
        const segmentGroup = startingPosition.processChildren ?
            updateSegmentGroupChildren(startingPosition.segmentGroup, startingPosition.index, nav.commands) :
            updateSegmentGroup(startingPosition.segmentGroup, startingPosition.index, nav.commands);
        return tree(urlTree.root, startingPosition.segmentGroup, segmentGroup, queryParams, fragment);
    }
    // Note: The types should disallow `snapshot` from being `undefined` but due to test mocks, this
    // may be the case. Since we try to access it at an earlier point before the refactor to add the
    // warning for `relativeLinkResolution: 'legacy'`, this may cause failures in tests where it
    // didn't before.
    const result = createTreeUsingPathIndex(route.snapshot?._lastPathIndex);
    return result;
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
        forEach(queryParams, (value, name) => {
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
    forEach(current.children, (c, outletName) => {
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
            throw new RuntimeError(4003 /* RuntimeErrorCode.ROOT_SEGMENT_MATRIX_PARAMS */, NG_DEV_MODE && 'Root segment cannot have matrix parameters');
        }
        const cmdWithOutlet = commands.find(isCommandWithOutlets);
        if (cmdWithOutlet && cmdWithOutlet !== last(commands)) {
            throw new RuntimeError(4004 /* RuntimeErrorCode.MISPLACED_OUTLETS_COMMAND */, NG_DEV_MODE && '{outlets:{}} has to be the last command');
        }
    }
    toRoot() {
        return this.isAbsolute && this.commands.length === 1 && this.commands[0] == '/';
    }
}
/** Transforms commands to a normalized `Navigation` */
function computeNavigation(commands) {
    if ((typeof commands[0] === 'string') && commands.length === 1 && commands[0] === '/') {
        return new Navigation(true, 0, commands);
    }
    let numberOfDoubleDots = 0;
    let isAbsolute = false;
    const res = commands.reduce((res, cmd, cmdIdx) => {
        if (typeof cmd === 'object' && cmd != null) {
            if (cmd.outlets) {
                const outlets = {};
                forEach(cmd.outlets, (commands, name) => {
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
                else if (partIndex == 0 && urlPart === '') { //  '/a'
                    isAbsolute = true;
                }
                else if (urlPart === '..') { //  '../a'
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
function findStartingPosition(nav, tree, segmentGroup, lastPathIndex) {
    if (nav.isAbsolute) {
        return new Position(tree.root, true, 0);
    }
    if (lastPathIndex === -1) {
        // Pathless ActivatedRoute has _lastPathIndex === -1 but should not process children
        // see issue #26224, #13011, #35687
        // However, if the ActivatedRoute is the root we should process children like above.
        const processChildren = segmentGroup === tree.root;
        return new Position(segmentGroup, processChildren, 0);
    }
    const modifier = isMatrixParams(nav.commands[0]) ? 0 : 1;
    const index = lastPathIndex + modifier;
    return createPositionApplyingDoubleDots(segmentGroup, index, nav.numberOfDoubleDots);
}
function createPositionApplyingDoubleDots(group, index, numberOfDoubleDots) {
    let g = group;
    let ci = index;
    let dd = numberOfDoubleDots;
    while (dd > ci) {
        dd -= ci;
        g = g.parent;
        if (!g) {
            throw new RuntimeError(4005 /* RuntimeErrorCode.INVALID_DOUBLE_DOTS */, NG_DEV_MODE && 'Invalid number of \'../\'');
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
    if (!segmentGroup) {
        segmentGroup = new UrlSegmentGroup([], {});
    }
    if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
        return updateSegmentGroupChildren(segmentGroup, startIndex, commands);
    }
    const m = prefixedWith(segmentGroup, startIndex, commands);
    const slicedCommands = commands.slice(m.commandIndex);
    if (m.match && m.pathIndex < segmentGroup.segments.length) {
        const g = new UrlSegmentGroup(segmentGroup.segments.slice(0, m.pathIndex), {});
        g.children[PRIMARY_OUTLET] =
            new UrlSegmentGroup(segmentGroup.segments.slice(m.pathIndex), segmentGroup.children);
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
        // If the set of commands does not apply anything to the primary outlet and the child segment is
        // an empty path primary segment on its own, we want to skip applying the commands at this
        // level. Imagine the following config:
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
        if (!outlets[PRIMARY_OUTLET] && segmentGroup.children[PRIMARY_OUTLET] &&
            segmentGroup.numberOfChildren === 1 &&
            segmentGroup.children[PRIMARY_OUTLET].segments.length === 0) {
            return updateSegmentGroupChildren(segmentGroup.children[PRIMARY_OUTLET], startIndex, commands);
        }
        forEach(outlets, (commands, outlet) => {
            if (typeof commands === 'string') {
                commands = [commands];
            }
            if (commands !== null) {
                children[outlet] = updateSegmentGroup(segmentGroup.children[outlet], startIndex, commands);
            }
        });
        forEach(segmentGroup.children, (child, childOutlet) => {
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
        if (curr && next && (typeof next === 'object') && next.outlets === undefined) {
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
        const next = (i < commands.length - 1) ? commands[i + 1] : null;
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
    forEach(outlets, (commands, outlet) => {
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
    forEach(params, (v, k) => res[k] = `${v}`);
    return res;
}
function compare(path, params, segment) {
    return path == segment.path && shallowEqual(params, segment.parameters);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlX3VybF90cmVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9jcmVhdGVfdXJsX3RyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGFBQWEsSUFBSSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFJNUQsT0FBTyxFQUFTLGNBQWMsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNoRCxPQUFPLEVBQUMsVUFBVSxFQUFFLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ2hHLE9BQU8sRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBRS9ELE1BQU0sV0FBVyxHQUFHLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLENBQUM7QUFFbEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0RHO0FBQ0gsTUFBTSxVQUFVLHlCQUF5QixDQUNyQyxVQUFrQyxFQUFFLFFBQWUsRUFBRSxjQUEyQixJQUFJLEVBQ3BGLFdBQXdCLElBQUk7SUFDOUIsTUFBTSx5QkFBeUIsR0FBRywyQkFBMkIsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUMxRSxPQUFPLDZCQUE2QixDQUFDLHlCQUF5QixFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDbkcsQ0FBQztBQUVELE1BQU0sVUFBVSwyQkFBMkIsQ0FBQyxLQUE2QjtJQUN2RSxJQUFJLFdBQXNDLENBQUM7SUFFM0MsU0FBUyxvQ0FBb0MsQ0FBQyxZQUFvQztRQUVoRixNQUFNLFlBQVksR0FBd0MsRUFBRSxDQUFDO1FBQzdELEtBQUssTUFBTSxhQUFhLElBQUksWUFBWSxDQUFDLFFBQVEsRUFBRTtZQUNqRCxNQUFN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LENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDeEQsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBRUQsU0FBUyxPQUFPLENBQUMsSUFBWSxFQUFFLE1BQTRCLEVBQUUsT0FBbUI7SUFDOUUsT0FBTyxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxZQUFZLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMxRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQge0FjdGl2YXRlZFJvdXRlLCBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90fSBmcm9tICcuL3JvdXRlcl9zdGF0ZSc7XG5pbXBvcnQge1BhcmFtcywgUFJJTUFSWV9PVVRMRVR9IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7Y3JlYXRlUm9vdCwgc3F1YXNoU2VnbWVudEdyb3VwLCBVcmxTZWdtZW50LCBVcmxTZWdtZW50R3JvdXAsIFVybFRyZWV9IGZyb20gJy4vdXJsX3RyZWUnO1xuaW1wb3J0IHtmb3JFYWNoLCBsYXN0LCBzaGFsbG93RXF1YWx9IGZyb20gJy4vdXRpbHMvY29sbGVjdGlvbic7XG5cbmNvbnN0IE5HX0RFVl9NT0RFID0gdHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBgVXJsVHJlZWAgcmVsYXRpdmUgdG8gYW4gYEFjdGl2YXRlZFJvdXRlU25hcHNob3RgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKlxuICogQHBhcmFtIHJlbGF0aXZlVG8gVGhlIGBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90YCB0byBhcHBseSB0aGUgY29tbWFuZHMgdG9cbiAqIEBwYXJhbSBjb21tYW5kcyBBbiBhcnJheSBvZiBVUkwgZnJhZ21lbnRzIHdpdGggd2hpY2ggdG8gY29uc3RydWN0IHRoZSBuZXcgVVJMIHRyZWUuXG4gKiBJZiB0aGUgcGF0aCBpcyBzdGF0aWMsIGNhbiBiZSB0aGUgbGl0ZXJhbCBVUkwgc3RyaW5nLiBGb3IgYSBkeW5hbWljIHBhdGgsIHBhc3MgYW4gYXJyYXkgb2YgcGF0aFxuICogc2VnbWVudHMsIGZvbGxvd2VkIGJ5IHRoZSBwYXJhbWV0ZXJzIGZvciBlYWNoIHNlZ21lbnQuXG4gKiBUaGUgZnJhZ21lbnRzIGFyZSBhcHBsaWVkIHRvIHRoZSBvbmUgcHJvdmlkZWQgaW4gdGhlIGByZWxhdGl2ZVRvYCBwYXJhbWV0ZXIuXG4gKiBAcGFyYW0gcXVlcnlQYXJhbXMgVGhlIHF1ZXJ5IHBhcmFtZXRlcnMgZm9yIHRoZSBgVXJsVHJlZWAuIGBudWxsYCBpZiB0aGUgYFVybFRyZWVgIGRvZXMgbm90IGhhdmVcbiAqICAgICBhbnkgcXVlcnkgcGFyYW1ldGVycy5cbiAqIEBwYXJhbSBmcmFnbWVudCBUaGUgZnJhZ21lbnQgZm9yIHRoZSBgVXJsVHJlZWAuIGBudWxsYCBpZiB0aGUgYFVybFRyZWVgIGRvZXMgbm90IGhhdmUgYSBmcmFnbWVudC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIGBgYFxuICogLy8gY3JlYXRlIC90ZWFtLzMzL3VzZXIvMTFcbiAqIGNyZWF0ZVVybFRyZWVGcm9tU25hcHNob3Qoc25hcHNob3QsIFsnL3RlYW0nLCAzMywgJ3VzZXInLCAxMV0pO1xuICpcbiAqIC8vIGNyZWF0ZSAvdGVhbS8zMztleHBhbmQ9dHJ1ZS91c2VyLzExXG4gKiBjcmVhdGVVcmxUcmVlRnJvbVNuYXBzaG90KHNuYXBzaG90LCBbJy90ZWFtJywgMzMsIHtleHBhbmQ6IHRydWV9LCAndXNlcicsIDExXSk7XG4gKlxuICogLy8geW91IGNhbiBjb2xsYXBzZSBzdGF0aWMgc2VnbWVudHMgbGlrZSB0aGlzICh0aGlzIHdvcmtzIG9ubHkgd2l0aCB0aGUgZmlyc3QgcGFzc2VkLWluIHZhbHVlKTpcbiAqIGNyZWF0ZVVybFRyZWVGcm9tU25hcHNob3Qoc25hcHNob3QsIFsnL3RlYW0vMzMvdXNlcicsIHVzZXJJZF0pO1xuICpcbiAqIC8vIElmIHRoZSBmaXJzdCBzZWdtZW50IGNhbiBjb250YWluIHNsYXNoZXMsIGFuZCB5b3UgZG8gbm90IHdhbnQgdGhlIHJvdXRlciB0byBzcGxpdCBpdCxcbiAqIC8vIHlvdSBjYW4gZG8gdGhlIGZvbGxvd2luZzpcbiAqIGNyZWF0ZVVybFRyZWVGcm9tU25hcHNob3Qoc25hcHNob3QsIFt7c2VnbWVudFBhdGg6ICcvb25lL3R3byd9XSk7XG4gKlxuICogLy8gY3JlYXRlIC90ZWFtLzMzLyh1c2VyLzExLy9yaWdodDpjaGF0KVxuICogY3JlYXRlVXJsVHJlZUZyb21TbmFwc2hvdChzbmFwc2hvdCwgWycvdGVhbScsIDMzLCB7b3V0bGV0czoge3ByaW1hcnk6ICd1c2VyLzExJywgcmlnaHQ6XG4gKiAnY2hhdCd9fV0sIG51bGwsIG51bGwpO1xuICpcbiAqIC8vIHJlbW92ZSB0aGUgcmlnaHQgc2Vjb25kYXJ5IG5vZGVcbiAqIGNyZWF0ZVVybFRyZWVGcm9tU25hcHNob3Qoc25hcHNob3QsIFsnL3RlYW0nLCAzMywge291dGxldHM6IHtwcmltYXJ5OiAndXNlci8xMScsIHJpZ2h0OiBudWxsfX1dKTtcbiAqXG4gKiAvLyBGb3IgdGhlIGV4YW1wbGVzIGJlbG93LCBhc3N1bWUgdGhlIGN1cnJlbnQgVVJMIGlzIGZvciB0aGUgYC90ZWFtLzMzL3VzZXIvMTFgIGFuZCB0aGVcbiAqIGBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90YCBwb2ludHMgdG8gYHVzZXIvMTFgOlxuICpcbiAqIC8vIG5hdmlnYXRlIHRvIC90ZWFtLzMzL3VzZXIvMTEvZGV0YWlsc1xuICogY3JlYXRlVXJsVHJlZUZyb21TbmFwc2hvdChzbmFwc2hvdCwgWydkZXRhaWxzJ10pO1xuICpcbiAqIC8vIG5hdmlnYXRlIHRvIC90ZWFtLzMzL3VzZXIvMjJcbiAqIGNyZWF0ZVVybFRyZWVGcm9tU25hcHNob3Qoc25hcHNob3QsIFsnLi4vMjInXSk7XG4gKlxuICogLy8gbmF2aWdhdGUgdG8gL3RlYW0vNDQvdXNlci8yMlxuICogY3JlYXRlVXJsVHJlZUZyb21TbmFwc2hvdChzbmFwc2hvdCwgWycuLi8uLi90ZWFtLzQ0L3VzZXIvMjInXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVVybFRyZWVGcm9tU25hcHNob3QoXG4gICAgcmVsYXRpdmVUbzogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgY29tbWFuZHM6IGFueVtdLCBxdWVyeVBhcmFtczogUGFyYW1zfG51bGwgPSBudWxsLFxuICAgIGZyYWdtZW50OiBzdHJpbmd8bnVsbCA9IG51bGwpOiBVcmxUcmVlIHtcbiAgY29uc3QgcmVsYXRpdmVUb1VybFNlZ21lbnRHcm91cCA9IGNyZWF0ZVNlZ21lbnRHcm91cEZyb21Sb3V0ZShyZWxhdGl2ZVRvKTtcbiAgcmV0dXJuIGNyZWF0ZVVybFRyZWVGcm9tU2VnbWVudEdyb3VwKHJlbGF0aXZlVG9VcmxTZWdtZW50R3JvdXAsIGNvbW1hbmRzLCBxdWVyeVBhcmFtcywgZnJhZ21lbnQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2VnbWVudEdyb3VwRnJvbVJvdXRlKHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KTogVXJsU2VnbWVudEdyb3VwIHtcbiAgbGV0IHRhcmdldEdyb3VwOiBVcmxTZWdtZW50R3JvdXB8dW5kZWZpbmVkO1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZVNlZ21lbnRHcm91cEZyb21Sb3V0ZVJlY3Vyc2l2ZShjdXJyZW50Um91dGU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QpOlxuICAgICAgVXJsU2VnbWVudEdyb3VwIHtcbiAgICBjb25zdCBjaGlsZE91dGxldHM6IHtbb3V0bGV0OiBzdHJpbmddOiBVcmxTZWdtZW50R3JvdXB9ID0ge307XG4gICAgZm9yIChjb25zdCBjaGlsZFNuYXBzaG90IG9mIGN1cnJlbnRSb3V0ZS5jaGlsZHJlbikge1xuICAgICAgY29uc3Qgcm9vdCA9IGNyZWF0ZVNlZ21lbnRHcm91cEZyb21Sb3V0ZVJlY3Vyc2l2ZShjaGlsZFNuYXBzaG90KTtcbiAgICAgIGNoaWxkT3V0bGV0c1tjaGlsZFNuYXBzaG90Lm91dGxldF0gPSByb290O1xuICAgIH1cbiAgICBjb25zdCBzZWdtZW50R3JvdXAgPSBuZXcgVXJsU2VnbWVudEdyb3VwKGN1cnJlbnRSb3V0ZS51cmwsIGNoaWxkT3V0bGV0cyk7XG4gICAgaWYgKGN1cnJlbnRSb3V0ZSA9PT0gcm91dGUpIHtcbiAgICAgIHRhcmdldEdyb3VwID0gc2VnbWVudEdyb3VwO1xuICAgIH1cbiAgICByZXR1cm4gc2VnbWVudEdyb3VwO1xuICB9XG4gIGNvbnN0IHJvb3RDYW5kaWRhdGUgPSBjcmVhdGVTZWdtZW50R3JvdXBGcm9tUm91dGVSZWN1cnNpdmUocm91dGUucm9vdCk7XG4gIGNvbnN0IHJvb3RTZWdtZW50R3JvdXAgPSBjcmVhdGVSb290KHJvb3RDYW5kaWRhdGUpO1xuXG4gIHJldHVybiB0YXJnZXRHcm91cCA/PyByb290U2VnbWVudEdyb3VwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVXJsVHJlZUZyb21TZWdtZW50R3JvdXAoXG4gICAgcmVsYXRpdmVUbzogVXJsU2VnbWVudEdyb3VwLCBjb21tYW5kczogYW55W10sIHF1ZXJ5UGFyYW1zOiBQYXJhbXN8bnVsbCxcbiAgICBmcmFnbWVudDogc3RyaW5nfG51bGwpOiBVcmxUcmVlIHtcbiAgbGV0IHJvb3QgPSByZWxhdGl2ZVRvO1xuICB3aGlsZSAocm9vdC5wYXJlbnQpIHtcbiAgICByb290ID0gcm9vdC5wYXJlbnQ7XG4gIH1cbiAgLy8gVGhlcmUgYXJlIG5vIGNvbW1hbmRzIHNvIHRoZSBgVXJsVHJlZWAgZ29lcyB0byB0aGUgc2FtZSBwYXRoIGFzIHRoZSBvbmUgY3JlYXRlZCBmcm9tIHRoZVxuICAvLyBgVXJsU2VnbWVudEdyb3VwYC4gQWxsIHdlIG5lZWQgdG8gZG8gaXMgdXBkYXRlIHRoZSBgcXVlcnlQYXJhbXNgIGFuZCBgZnJhZ21lbnRgIHdpdGhvdXRcbiAgLy8gYXBwbHlpbmcgYW55IG90aGVyIGxvZ2ljLlxuICBpZiAoY29tbWFuZHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRyZWUocm9vdCwgcm9vdCwgcm9vdCwgcXVlcnlQYXJhbXMsIGZyYWdtZW50KTtcbiAgfVxuXG4gIGNvbnN0IG5hdiA9IGNvbXB1dGVOYXZpZ2F0aW9uKGNvbW1hbmRzKTtcblxuICBpZiAobmF2LnRvUm9vdCgpKSB7XG4gICAgcmV0dXJuIHRyZWUocm9vdCwgcm9vdCwgbmV3IFVybFNlZ21lbnRHcm91cChbXSwge30pLCBxdWVyeVBhcmFtcywgZnJhZ21lbnQpO1xuICB9XG5cbiAgY29uc3QgcG9zaXRpb24gPSBmaW5kU3RhcnRpbmdQb3NpdGlvbkZvclRhcmdldEdyb3VwKG5hdiwgcm9vdCwgcmVsYXRpdmVUbyk7XG4gIGNvbnN0IG5ld1NlZ21lbnRHcm91cCA9IHBvc2l0aW9uLnByb2Nlc3NDaGlsZHJlbiA/XG4gICAgICB1cGRhdGVTZWdtZW50R3JvdXBDaGlsZHJlbihwb3NpdGlvbi5zZWdtZW50R3JvdXAsIHBvc2l0aW9uLmluZGV4LCBuYXYuY29tbWFuZHMpIDpcbiAgICAgIHVwZGF0ZVNlZ21lbnRHcm91cChwb3NpdGlvbi5zZWdtZW50R3JvdXAsIHBvc2l0aW9uLmluZGV4LCBuYXYuY29tbWFuZHMpO1xuICByZXR1cm4gdHJlZShyb290LCBwb3NpdGlvbi5zZWdtZW50R3JvdXAsIG5ld1NlZ21lbnRHcm91cCwgcXVlcnlQYXJhbXMsIGZyYWdtZW50KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVVybFRyZWUoXG4gICAgcm91dGU6IEFjdGl2YXRlZFJvdXRlLCB1cmxUcmVlOiBVcmxUcmVlLCBjb21tYW5kczogYW55W10sIHF1ZXJ5UGFyYW1zOiBQYXJhbXN8bnVsbCxcbiAgICBmcmFnbWVudDogc3RyaW5nfG51bGwpOiBVcmxUcmVlIHtcbiAgaWYgKGNvbW1hbmRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0cmVlKHVybFRyZWUucm9vdCwgdXJsVHJlZS5yb290LCB1cmxUcmVlLnJvb3QsIHF1ZXJ5UGFyYW1zLCBmcmFnbWVudCk7XG4gIH1cblxuICBjb25zdCBuYXYgPSBjb21wdXRlTmF2aWdhdGlvbihjb21tYW5kcyk7XG5cbiAgaWYgKG5hdi50b1Jvb3QoKSkge1xuICAgIHJldHVybiB0cmVlKHVybFRyZWUucm9vdCwgdXJsVHJlZS5yb290LCBuZXcgVXJsU2VnbWVudEdyb3VwKFtdLCB7fSksIHF1ZXJ5UGFyYW1zLCBmcmFnbWVudCk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVUcmVlVXNpbmdQYXRoSW5kZXgobGFzdFBhdGhJbmRleDogbnVtYmVyKSB7XG4gICAgY29uc3Qgc3RhcnRpbmdQb3NpdGlvbiA9XG4gICAgICAgIGZpbmRTdGFydGluZ1Bvc2l0aW9uKG5hdiwgdXJsVHJlZSwgcm91dGUuc25hcHNob3Q/Ll91cmxTZWdtZW50LCBsYXN0UGF0aEluZGV4KTtcblxuICAgIGNvbnN0IHNlZ21lbnRHcm91cCA9IHN0YXJ0aW5nUG9zaXRpb24ucHJvY2Vzc0NoaWxkcmVuID9cbiAgICAgICAgdXBkYXRlU2VnbWVudEdyb3VwQ2hpbGRyZW4oXG4gICAgICAgICAgICBzdGFydGluZ1Bvc2l0aW9uLnNlZ21lbnRHcm91cCwgc3RhcnRpbmdQb3NpdGlvbi5pbmRleCwgbmF2LmNvbW1hbmRzKSA6XG4gICAgICAgIHVwZGF0ZVNlZ21lbnRHcm91cChzdGFydGluZ1Bvc2l0aW9uLnNlZ21lbnRHcm91cCwgc3RhcnRpbmdQb3NpdGlvbi5pbmRleCwgbmF2LmNvbW1hbmRzKTtcbiAgICByZXR1cm4gdHJlZSh1cmxUcmVlLnJvb3QsIHN0YXJ0aW5nUG9zaXRpb24uc2VnbWVudEdyb3VwLCBzZWdtZW50R3JvdXAsIHF1ZXJ5UGFyYW1zLCBmcmFnbWVudCk7XG4gIH1cbiAgLy8gTm90ZTogVGhlIHR5cGVzIHNob3VsZCBkaXNhbGxvdyBgc25hcHNob3RgIGZyb20gYmVpbmcgYHVuZGVmaW5lZGAgYnV0IGR1ZSB0byB0ZXN0IG1vY2tzLCB0aGlzXG4gIC8vIG1heSBiZSB0aGUgY2FzZS4gU2luY2Ugd2UgdHJ5IHRvIGFjY2VzcyBpdCBhdCBhbiBlYXJsaWVyIHBvaW50IGJlZm9yZSB0aGUgcmVmYWN0b3IgdG8gYWRkIHRoZVxuICAvLyB3YXJuaW5nIGZvciBgcmVsYXRpdmVMaW5rUmVzb2x1dGlvbjogJ2xlZ2FjeSdgLCB0aGlzIG1heSBjYXVzZSBmYWlsdXJlcyBpbiB0ZXN0cyB3aGVyZSBpdFxuICAvLyBkaWRuJ3QgYmVmb3JlLlxuICBjb25zdCByZXN1bHQgPSBjcmVhdGVUcmVlVXNpbmdQYXRoSW5kZXgocm91dGUuc25hcHNob3Q/Ll9sYXN0UGF0aEluZGV4KTtcblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBpc01hdHJpeFBhcmFtcyhjb21tYW5kOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBjb21tYW5kID09PSAnb2JqZWN0JyAmJiBjb21tYW5kICE9IG51bGwgJiYgIWNvbW1hbmQub3V0bGV0cyAmJiAhY29tbWFuZC5zZWdtZW50UGF0aDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIGEgZ2l2ZW4gY29tbWFuZCBoYXMgYW4gYG91dGxldHNgIG1hcC4gV2hlbiB3ZSBlbmNvdW50ZXIgYSBjb21tYW5kXG4gKiB3aXRoIGFuIG91dGxldHMgay92IG1hcCwgd2UgbmVlZCB0byBhcHBseSBlYWNoIG91dGxldCBpbmRpdmlkdWFsbHkgdG8gdGhlIGV4aXN0aW5nIHNlZ21lbnQuXG4gKi9cbmZ1bmN0aW9uIGlzQ29tbWFuZFdpdGhPdXRsZXRzKGNvbW1hbmQ6IGFueSk6IGNvbW1hbmQgaXMge291dGxldHM6IHtba2V5OiBzdHJpbmddOiBhbnl9fSB7XG4gIHJldHVybiB0eXBlb2YgY29tbWFuZCA9PT0gJ29iamVjdCcgJiYgY29tbWFuZCAhPSBudWxsICYmIGNvbW1hbmQub3V0bGV0cztcbn1cblxuZnVuY3Rpb24gdHJlZShcbiAgICBvbGRSb290OiBVcmxTZWdtZW50R3JvdXAsIG9sZFNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLCBuZXdTZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCxcbiAgICBxdWVyeVBhcmFtczogUGFyYW1zfG51bGwsIGZyYWdtZW50OiBzdHJpbmd8bnVsbCk6IFVybFRyZWUge1xuICBsZXQgcXA6IGFueSA9IHt9O1xuICBpZiAocXVlcnlQYXJhbXMpIHtcbiAgICBmb3JFYWNoKHF1ZXJ5UGFyYW1zLCAodmFsdWU6IGFueSwgbmFtZTogYW55KSA9PiB7XG4gICAgICBxcFtuYW1lXSA9IEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUubWFwKCh2OiBhbnkpID0+IGAke3Z9YCkgOiBgJHt2YWx1ZX1gO1xuICAgIH0pO1xuICB9XG5cbiAgbGV0IHJvb3RDYW5kaWRhdGU6IFVybFNlZ21lbnRHcm91cDtcbiAgaWYgKG9sZFJvb3QgPT09IG9sZFNlZ21lbnRHcm91cCkge1xuICAgIHJvb3RDYW5kaWRhdGUgPSBuZXdTZWdtZW50R3JvdXA7XG4gIH0gZWxzZSB7XG4gICAgcm9vdENhbmRpZGF0ZSA9IHJlcGxhY2VTZWdtZW50KG9sZFJvb3QsIG9sZFNlZ21lbnRHcm91cCwgbmV3U2VnbWVudEdyb3VwKTtcbiAgfVxuXG4gIGNvbnN0IG5ld1Jvb3QgPSBjcmVhdGVSb290KHNxdWFzaFNlZ21lbnRHcm91cChyb290Q2FuZGlkYXRlKSk7XG4gIHJldHVybiBuZXcgVXJsVHJlZShuZXdSb290LCBxcCwgZnJhZ21lbnQpO1xufVxuXG4vKipcbiAqIFJlcGxhY2VzIHRoZSBgb2xkU2VnbWVudGAgd2hpY2ggaXMgbG9jYXRlZCBpbiBzb21lIGNoaWxkIG9mIHRoZSBgY3VycmVudGAgd2l0aCB0aGUgYG5ld1NlZ21lbnRgLlxuICogVGhpcyBhbHNvIGhhcyB0aGUgZWZmZWN0IG9mIGNyZWF0aW5nIG5ldyBgVXJsU2VnbWVudEdyb3VwYCBjb3BpZXMgdG8gdXBkYXRlIHJlZmVyZW5jZXMuIFRoaXNcbiAqIHNob3VsZG4ndCBiZSBuZWNlc3NhcnkgYnV0IHRoZSBmYWxsYmFjayBsb2dpYyBmb3IgYW4gaW52YWxpZCBBY3RpdmF0ZWRSb3V0ZSBpbiB0aGUgY3JlYXRpb24gdXNlc1xuICogdGhlIFJvdXRlcidzIGN1cnJlbnQgdXJsIHRyZWUuIElmIHdlIGRvbid0IGNyZWF0ZSBuZXcgc2VnbWVudCBncm91cHMsIHdlIGVuZCB1cCBtb2RpZnlpbmcgdGhhdFxuICogdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHJlcGxhY2VTZWdtZW50KFxuICAgIGN1cnJlbnQ6IFVybFNlZ21lbnRHcm91cCwgb2xkU2VnbWVudDogVXJsU2VnbWVudEdyb3VwLFxuICAgIG5ld1NlZ21lbnQ6IFVybFNlZ21lbnRHcm91cCk6IFVybFNlZ21lbnRHcm91cCB7XG4gIGNvbnN0IGNoaWxkcmVuOiB7W2tleTogc3RyaW5nXTogVXJsU2VnbWVudEdyb3VwfSA9IHt9O1xuICBmb3JFYWNoKGN1cnJlbnQuY2hpbGRyZW4sIChjOiBVcmxTZWdtZW50R3JvdXAsIG91dGxldE5hbWU6IHN0cmluZykgPT4ge1xuICAgIGlmIChjID09PSBvbGRTZWdtZW50KSB7XG4gICAgICBjaGlsZHJlbltvdXRsZXROYW1lXSA9IG5ld1NlZ21lbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoaWxkcmVuW291dGxldE5hbWVdID0gcmVwbGFjZVNlZ21lbnQoYywgb2xkU2VnbWVudCwgbmV3U2VnbWVudCk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG5ldyBVcmxTZWdtZW50R3JvdXAoY3VycmVudC5zZWdtZW50cywgY2hpbGRyZW4pO1xufVxuXG5jbGFzcyBOYXZpZ2F0aW9uIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgaXNBYnNvbHV0ZTogYm9vbGVhbiwgcHVibGljIG51bWJlck9mRG91YmxlRG90czogbnVtYmVyLCBwdWJsaWMgY29tbWFuZHM6IGFueVtdKSB7XG4gICAgaWYgKGlzQWJzb2x1dGUgJiYgY29tbWFuZHMubGVuZ3RoID4gMCAmJiBpc01hdHJpeFBhcmFtcyhjb21tYW5kc1swXSkpIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5ST09UX1NFR01FTlRfTUFUUklYX1BBUkFNUyxcbiAgICAgICAgICBOR19ERVZfTU9ERSAmJiAnUm9vdCBzZWdtZW50IGNhbm5vdCBoYXZlIG1hdHJpeCBwYXJhbWV0ZXJzJyk7XG4gICAgfVxuXG4gICAgY29uc3QgY21kV2l0aE91dGxldCA9IGNvbW1hbmRzLmZpbmQoaXNDb21tYW5kV2l0aE91dGxldHMpO1xuICAgIGlmIChjbWRXaXRoT3V0bGV0ICYmIGNtZFdpdGhPdXRsZXQgIT09IGxhc3QoY29tbWFuZHMpKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTUlTUExBQ0VEX09VVExFVFNfQ09NTUFORCxcbiAgICAgICAgICBOR19ERVZfTU9ERSAmJiAne291dGxldHM6e319IGhhcyB0byBiZSB0aGUgbGFzdCBjb21tYW5kJyk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHRvUm9vdCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0Fic29sdXRlICYmIHRoaXMuY29tbWFuZHMubGVuZ3RoID09PSAxICYmIHRoaXMuY29tbWFuZHNbMF0gPT0gJy8nO1xuICB9XG59XG5cbi8qKiBUcmFuc2Zvcm1zIGNvbW1hbmRzIHRvIGEgbm9ybWFsaXplZCBgTmF2aWdhdGlvbmAgKi9cbmZ1bmN0aW9uIGNvbXB1dGVOYXZpZ2F0aW9uKGNvbW1hbmRzOiBhbnlbXSk6IE5hdmlnYXRpb24ge1xuICBpZiAoKHR5cGVvZiBjb21tYW5kc1swXSA9PT0gJ3N0cmluZycpICYmIGNvbW1hbmRzLmxlbmd0aCA9PT0gMSAmJiBjb21tYW5kc1swXSA9PT0gJy8nKSB7XG4gICAgcmV0dXJuIG5ldyBOYXZpZ2F0aW9uKHRydWUsIDAsIGNvbW1hbmRzKTtcbiAgfVxuXG4gIGxldCBudW1iZXJPZkRvdWJsZURvdHMgPSAwO1xuICBsZXQgaXNBYnNvbHV0ZSA9IGZhbHNlO1xuXG4gIGNvbnN0IHJlczogYW55W10gPSBjb21tYW5kcy5yZWR1Y2UoKHJlcywgY21kLCBjbWRJZHgpID0+IHtcbiAgICBpZiAodHlwZW9mIGNtZCA9PT0gJ29iamVjdCcgJiYgY21kICE9IG51bGwpIHtcbiAgICAgIGlmIChjbWQub3V0bGV0cykge1xuICAgICAgICBjb25zdCBvdXRsZXRzOiB7W2s6IHN0cmluZ106IGFueX0gPSB7fTtcbiAgICAgICAgZm9yRWFjaChjbWQub3V0bGV0cywgKGNvbW1hbmRzOiBhbnksIG5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgIG91dGxldHNbbmFtZV0gPSB0eXBlb2YgY29tbWFuZHMgPT09ICdzdHJpbmcnID8gY29tbWFuZHMuc3BsaXQoJy8nKSA6IGNvbW1hbmRzO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIFsuLi5yZXMsIHtvdXRsZXRzfV07XG4gICAgICB9XG5cbiAgICAgIGlmIChjbWQuc2VnbWVudFBhdGgpIHtcbiAgICAgICAgcmV0dXJuIFsuLi5yZXMsIGNtZC5zZWdtZW50UGF0aF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCEodHlwZW9mIGNtZCA9PT0gJ3N0cmluZycpKSB7XG4gICAgICByZXR1cm4gWy4uLnJlcywgY21kXTtcbiAgICB9XG5cbiAgICBpZiAoY21kSWR4ID09PSAwKSB7XG4gICAgICBjbWQuc3BsaXQoJy8nKS5mb3JFYWNoKCh1cmxQYXJ0LCBwYXJ0SW5kZXgpID0+IHtcbiAgICAgICAgaWYgKHBhcnRJbmRleCA9PSAwICYmIHVybFBhcnQgPT09ICcuJykge1xuICAgICAgICAgIC8vIHNraXAgJy4vYSdcbiAgICAgICAgfSBlbHNlIGlmIChwYXJ0SW5kZXggPT0gMCAmJiB1cmxQYXJ0ID09PSAnJykgeyAgLy8gICcvYSdcbiAgICAgICAgICBpc0Fic29sdXRlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmICh1cmxQYXJ0ID09PSAnLi4nKSB7ICAvLyAgJy4uL2EnXG4gICAgICAgICAgbnVtYmVyT2ZEb3VibGVEb3RzKys7XG4gICAgICAgIH0gZWxzZSBpZiAodXJsUGFydCAhPSAnJykge1xuICAgICAgICAgIHJlcy5wdXNoKHVybFBhcnQpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICByZXR1cm4gWy4uLnJlcywgY21kXTtcbiAgfSwgW10pO1xuXG4gIHJldHVybiBuZXcgTmF2aWdhdGlvbihpc0Fic29sdXRlLCBudW1iZXJPZkRvdWJsZURvdHMsIHJlcyk7XG59XG5cbmNsYXNzIFBvc2l0aW9uIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsIHB1YmxpYyBwcm9jZXNzQ2hpbGRyZW46IGJvb2xlYW4sIHB1YmxpYyBpbmRleDogbnVtYmVyKSB7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmluZFN0YXJ0aW5nUG9zaXRpb25Gb3JUYXJnZXRHcm91cChcbiAgICBuYXY6IE5hdmlnYXRpb24sIHJvb3Q6IFVybFNlZ21lbnRHcm91cCwgdGFyZ2V0OiBVcmxTZWdtZW50R3JvdXApOiBQb3NpdGlvbiB7XG4gIGlmIChuYXYuaXNBYnNvbHV0ZSkge1xuICAgIHJldHVybiBuZXcgUG9zaXRpb24ocm9vdCwgdHJ1ZSwgMCk7XG4gIH1cblxuICBpZiAoIXRhcmdldCkge1xuICAgIC8vIGBOYU5gIGlzIHVzZWQgb25seSB0byBtYWludGFpbiBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSB3aXRoIGluY29ycmVjdGx5IG1vY2tlZFxuICAgIC8vIGBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90YCBpbiB0ZXN0cy4gSW4gcHJpb3IgdmVyc2lvbnMgb2YgdGhpcyBjb2RlLCB0aGUgcG9zaXRpb24gaGVyZSB3YXNcbiAgICAvLyBkZXRlcm1pbmVkIGJhc2VkIG9uIGFuIGludGVybmFsIHByb3BlcnR5IHRoYXQgd2FzIHJhcmVseSBtb2NrZWQsIHJlc3VsdGluZyBpbiBgTmFOYC4gSW5cbiAgICAvLyByZWFsaXR5LCB0aGlzIGNvZGUgcGF0aCBzaG91bGQgX25ldmVyXyBiZSB0b3VjaGVkIHNpbmNlIGB0YXJnZXRgIGlzIG5vdCBhbGxvd2VkIHRvIGJlIGZhbHNleS5cbiAgICByZXR1cm4gbmV3IFBvc2l0aW9uKHJvb3QsIGZhbHNlLCBOYU4pO1xuICB9XG4gIGlmICh0YXJnZXQucGFyZW50ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG5ldyBQb3NpdGlvbih0YXJnZXQsIHRydWUsIDApO1xuICB9XG5cbiAgY29uc3QgbW9kaWZpZXIgPSBpc01hdHJpeFBhcmFtcyhuYXYuY29tbWFuZHNbMF0pID8gMCA6IDE7XG4gIGNvbnN0IGluZGV4ID0gdGFyZ2V0LnNlZ21lbnRzLmxlbmd0aCAtIDEgKyBtb2RpZmllcjtcbiAgcmV0dXJuIGNyZWF0ZVBvc2l0aW9uQXBwbHlpbmdEb3VibGVEb3RzKHRhcmdldCwgaW5kZXgsIG5hdi5udW1iZXJPZkRvdWJsZURvdHMpO1xufVxuXG5mdW5jdGlvbiBmaW5kU3RhcnRpbmdQb3NpdGlvbihcbiAgICBuYXY6IE5hdmlnYXRpb24sIHRyZWU6IFVybFRyZWUsIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLFxuICAgIGxhc3RQYXRoSW5kZXg6IG51bWJlcik6IFBvc2l0aW9uIHtcbiAgaWYgKG5hdi5pc0Fic29sdXRlKSB7XG4gICAgcmV0dXJuIG5ldyBQb3NpdGlvbih0cmVlLnJvb3QsIHRydWUsIDApO1xuICB9XG5cbiAgaWYgKGxhc3RQYXRoSW5kZXggPT09IC0xKSB7XG4gICAgLy8gUGF0aGxlc3MgQWN0aXZhdGVkUm91dGUgaGFzIF9sYXN0UGF0aEluZGV4ID09PSAtMSBidXQgc2hvdWxkIG5vdCBwcm9jZXNzIGNoaWxkcmVuXG4gICAgLy8gc2VlIGlzc3VlICMyNjIyNCwgIzEzMDExLCAjMzU2ODdcbiAgICAvLyBIb3dldmVyLCBpZiB0aGUgQWN0aXZhdGVkUm91dGUgaXMgdGhlIHJvb3Qgd2Ugc2hvdWxkIHByb2Nlc3MgY2hpbGRyZW4gbGlrZSBhYm92ZS5cbiAgICBjb25zdCBwcm9jZXNzQ2hpbGRyZW4gPSBzZWdtZW50R3JvdXAgPT09IHRyZWUucm9vdDtcbiAgICByZXR1cm4gbmV3IFBvc2l0aW9uKHNlZ21lbnRHcm91cCwgcHJvY2Vzc0NoaWxkcmVuLCAwKTtcbiAgfVxuXG4gIGNvbnN0IG1vZGlmaWVyID0gaXNNYXRyaXhQYXJhbXMobmF2LmNvbW1hbmRzWzBdKSA/IDAgOiAxO1xuICBjb25zdCBpbmRleCA9IGxhc3RQYXRoSW5kZXggKyBtb2RpZmllcjtcbiAgcmV0dXJuIGNyZWF0ZVBvc2l0aW9uQXBwbHlpbmdEb3VibGVEb3RzKHNlZ21lbnRHcm91cCwgaW5kZXgsIG5hdi5udW1iZXJPZkRvdWJsZURvdHMpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQb3NpdGlvbkFwcGx5aW5nRG91YmxlRG90cyhcbiAgICBncm91cDogVXJsU2VnbWVudEdyb3VwLCBpbmRleDogbnVtYmVyLCBudW1iZXJPZkRvdWJsZURvdHM6IG51bWJlcik6IFBvc2l0aW9uIHtcbiAgbGV0IGcgPSBncm91cDtcbiAgbGV0IGNpID0gaW5kZXg7XG4gIGxldCBkZCA9IG51bWJlck9mRG91YmxlRG90cztcbiAgd2hpbGUgKGRkID4gY2kpIHtcbiAgICBkZCAtPSBjaTtcbiAgICBnID0gZy5wYXJlbnQhO1xuICAgIGlmICghZykge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfRE9VQkxFX0RPVFMsIE5HX0RFVl9NT0RFICYmICdJbnZhbGlkIG51bWJlciBvZiBcXCcuLi9cXCcnKTtcbiAgICB9XG4gICAgY2kgPSBnLnNlZ21lbnRzLmxlbmd0aDtcbiAgfVxuICByZXR1cm4gbmV3IFBvc2l0aW9uKGcsIGZhbHNlLCBjaSAtIGRkKTtcbn1cblxuZnVuY3Rpb24gZ2V0T3V0bGV0cyhjb21tYW5kczogdW5rbm93bltdKToge1trOiBzdHJpbmddOiB1bmtub3duW118c3RyaW5nfSB7XG4gIGlmIChpc0NvbW1hbmRXaXRoT3V0bGV0cyhjb21tYW5kc1swXSkpIHtcbiAgICByZXR1cm4gY29tbWFuZHNbMF0ub3V0bGV0cztcbiAgfVxuXG4gIHJldHVybiB7W1BSSU1BUllfT1VUTEVUXTogY29tbWFuZHN9O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVTZWdtZW50R3JvdXAoXG4gICAgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsIHN0YXJ0SW5kZXg6IG51bWJlciwgY29tbWFuZHM6IGFueVtdKTogVXJsU2VnbWVudEdyb3VwIHtcbiAgaWYgKCFzZWdtZW50R3JvdXApIHtcbiAgICBzZWdtZW50R3JvdXAgPSBuZXcgVXJsU2VnbWVudEdyb3VwKFtdLCB7fSk7XG4gIH1cbiAgaWYgKHNlZ21lbnRHcm91cC5zZWdtZW50cy5sZW5ndGggPT09IDAgJiYgc2VnbWVudEdyb3VwLmhhc0NoaWxkcmVuKCkpIHtcbiAgICByZXR1cm4gdXBkYXRlU2VnbWVudEdyb3VwQ2hpbGRyZW4oc2VnbWVudEdyb3VwLCBzdGFydEluZGV4LCBjb21tYW5kcyk7XG4gIH1cblxuICBjb25zdCBtID0gcHJlZml4ZWRXaXRoKHNlZ21lbnRHcm91cCwgc3RhcnRJbmRleCwgY29tbWFuZHMpO1xuICBjb25zdCBzbGljZWRDb21tYW5kcyA9IGNvbW1hbmRzLnNsaWNlKG0uY29tbWFuZEluZGV4KTtcbiAgaWYgKG0ubWF0Y2ggJiYgbS5wYXRoSW5kZXggPCBzZWdtZW50R3JvdXAuc2VnbWVudHMubGVuZ3RoKSB7XG4gICAgY29uc3QgZyA9IG5ldyBVcmxTZWdtZW50R3JvdXAoc2VnbWVudEdyb3VwLnNlZ21lbnRzLnNsaWNlKDAsIG0ucGF0aEluZGV4KSwge30pO1xuICAgIGcuY2hpbGRyZW5bUFJJTUFSWV9PVVRMRVRdID1cbiAgICAgICAgbmV3IFVybFNlZ21lbnRHcm91cChzZWdtZW50R3JvdXAuc2VnbWVudHMuc2xpY2UobS5wYXRoSW5kZXgpLCBzZWdtZW50R3JvdXAuY2hpbGRyZW4pO1xuICAgIHJldHVybiB1cGRhdGVTZWdtZW50R3JvdXBDaGlsZHJlbihnLCAwLCBzbGljZWRDb21tYW5kcyk7XG4gIH0gZWxzZSBpZiAobS5tYXRjaCAmJiBzbGljZWRDb21tYW5kcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IFVybFNlZ21lbnRHcm91cChzZWdtZW50R3JvdXAuc2VnbWVudHMsIHt9KTtcbiAgfSBlbHNlIGlmIChtLm1hdGNoICYmICFzZWdtZW50R3JvdXAuaGFzQ2hpbGRyZW4oKSkge1xuICAgIHJldHVybiBjcmVhdGVOZXdTZWdtZW50R3JvdXAoc2VnbWVudEdyb3VwLCBzdGFydEluZGV4LCBjb21tYW5kcyk7XG4gIH0gZWxzZSBpZiAobS5tYXRjaCkge1xuICAgIHJldHVybiB1cGRhdGVTZWdtZW50R3JvdXBDaGlsZHJlbihzZWdtZW50R3JvdXAsIDAsIHNsaWNlZENvbW1hbmRzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY3JlYXRlTmV3U2VnbWVudEdyb3VwKHNlZ21lbnRHcm91cCwgc3RhcnRJbmRleCwgY29tbWFuZHMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVNlZ21lbnRHcm91cENoaWxkcmVuKFxuICAgIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLCBzdGFydEluZGV4OiBudW1iZXIsIGNvbW1hbmRzOiBhbnlbXSk6IFVybFNlZ21lbnRHcm91cCB7XG4gIGlmIChjb21tYW5kcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IFVybFNlZ21lbnRHcm91cChzZWdtZW50R3JvdXAuc2VnbWVudHMsIHt9KTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBvdXRsZXRzID0gZ2V0T3V0bGV0cyhjb21tYW5kcyk7XG4gICAgY29uc3QgY2hpbGRyZW46IHtba2V5OiBzdHJpbmddOiBVcmxTZWdtZW50R3JvdXB9ID0ge307XG4gICAgLy8gSWYgdGhlIHNldCBvZiBjb21tYW5kcyBkb2VzIG5vdCBhcHBseSBhbnl0aGluZyB0byB0aGUgcHJpbWFyeSBvdXRsZXQgYW5kIHRoZSBjaGlsZCBzZWdtZW50IGlzXG4gICAgLy8gYW4gZW1wdHkgcGF0aCBwcmltYXJ5IHNlZ21lbnQgb24gaXRzIG93biwgd2Ugd2FudCB0byBza2lwIGFwcGx5aW5nIHRoZSBjb21tYW5kcyBhdCB0aGlzXG4gICAgLy8gbGV2ZWwuIEltYWdpbmUgdGhlIGZvbGxvd2luZyBjb25maWc6XG4gICAgLy9cbiAgICAvLyB7cGF0aDogJycsIGNoaWxkcmVuOiBbe3BhdGg6ICcqKicsIG91dGxldDogJ3BvcHVwJ31dfS5cbiAgICAvL1xuICAgIC8vIE5hdmlnYXRpb24gdG8gLyhwb3B1cDphKSB3aWxsIGFjdGl2YXRlIHRoZSBjaGlsZCBvdXRsZXQgY29ycmVjdGx5IEdpdmVuIGEgZm9sbG93LXVwXG4gICAgLy8gbmF2aWdhdGlvbiB3aXRoIGNvbW1hbmRzXG4gICAgLy8gWycvJywge291dGxldHM6IHsncG9wdXAnOiAnYid9fV0sIHdlIF93b3VsZCBub3RfIHdhbnQgdG8gYXBwbHkgdGhlIG91dGxldCBjb21tYW5kcyB0byB0aGVcbiAgICAvLyByb290IHNlZ21lbnQgYmVjYXVzZSB0aGF0IHdvdWxkIHJlc3VsdCBpblxuICAgIC8vIC8vKHBvcHVwOmEpKHBvcHVwOmIpIHNpbmNlIHRoZSBvdXRsZXQgY29tbWFuZCBnb3QgYXBwbGllZCBvbmUgbGV2ZWwgYWJvdmUgd2hlcmUgaXQgYXBwZWFycyBpblxuICAgIC8vIHRoZSBgQWN0aXZhdGVkUm91dGVgIHJhdGhlciB0aGFuIHVwZGF0aW5nIHRoZSBleGlzdGluZyBvbmUuXG4gICAgLy9cbiAgICAvLyBCZWNhdXNlIGVtcHR5IHBhdGhzIGRvIG5vdCBhcHBlYXIgaW4gdGhlIFVSTCBzZWdtZW50cyBhbmQgdGhlIGZhY3QgdGhhdCB0aGUgc2VnbWVudHMgdXNlZCBpblxuICAgIC8vIHRoZSBvdXRwdXQgYFVybFRyZWVgIGFyZSBzcXVhc2hlZCB0byBlbGltaW5hdGUgdGhlc2UgZW1wdHkgcGF0aHMgd2hlcmUgcG9zc2libGVcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2Jsb2IvMTNmMTBkZTQwZTI1YzY5MDBjYTU1YmQ4M2IzNmJkNTMzZGFjZmE5ZS9wYWNrYWdlcy9yb3V0ZXIvc3JjL3VybF90cmVlLnRzI0w3NTVcbiAgICAvLyBpdCBjYW4gYmUgaGFyZCB0byBkZXRlcm1pbmUgd2hhdCBpcyB0aGUgcmlnaHQgdGhpbmcgdG8gZG8gd2hlbiBhcHBseWluZyBjb21tYW5kcyB0byBhXG4gICAgLy8gYFVybFNlZ21lbnRHcm91cGAgdGhhdCBpcyBjcmVhdGVkIGZyb20gYW4gXCJ1bnNxdWFzaGVkXCIvZXhwYW5kZWQgYEFjdGl2YXRlZFJvdXRlYCB0cmVlLlxuICAgIC8vIFRoaXMgY29kZSBlZmZlY3RpdmVseSBcInNxdWFzaGVzXCIgZW1wdHkgcGF0aCBwcmltYXJ5IHJvdXRlcyB3aGVuIHRoZXkgaGF2ZSBubyBzaWJsaW5ncyBvblxuICAgIC8vIHRoZSBzYW1lIGxldmVsIG9mIHRoZSB0cmVlLlxuICAgIGlmICghb3V0bGV0c1tQUklNQVJZX09VVExFVF0gJiYgc2VnbWVudEdyb3VwLmNoaWxkcmVuW1BSSU1BUllfT1VUTEVUXSAmJlxuICAgICAgICBzZWdtZW50R3JvdXAubnVtYmVyT2ZDaGlsZHJlbiA9PT0gMSAmJlxuICAgICAgICBzZWdtZW50R3JvdXAuY2hpbGRyZW5bUFJJTUFSWV9PVVRMRVRdLnNlZ21lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHVwZGF0ZVNlZ21lbnRHcm91cENoaWxkcmVuKFxuICAgICAgICAgIHNlZ21lbnRHcm91cC5jaGlsZHJlbltQUklNQVJZX09VVExFVF0sIHN0YXJ0SW5kZXgsIGNvbW1hbmRzKTtcbiAgICB9XG5cbiAgICBmb3JFYWNoKG91dGxldHMsIChjb21tYW5kcywgb3V0bGV0KSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGNvbW1hbmRzID09PSAnc3RyaW5nJykge1xuICAgICAgICBjb21tYW5kcyA9IFtjb21tYW5kc107XG4gICAgICB9XG4gICAgICBpZiAoY29tbWFuZHMgIT09IG51bGwpIHtcbiAgICAgICAgY2hpbGRyZW5bb3V0bGV0XSA9IHVwZGF0ZVNlZ21lbnRHcm91cChzZWdtZW50R3JvdXAuY2hpbGRyZW5bb3V0bGV0XSwgc3RhcnRJbmRleCwgY29tbWFuZHMpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZm9yRWFjaChzZWdtZW50R3JvdXAuY2hpbGRyZW4sIChjaGlsZDogVXJsU2VnbWVudEdyb3VwLCBjaGlsZE91dGxldDogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAob3V0bGV0c1tjaGlsZE91dGxldF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjaGlsZHJlbltjaGlsZE91dGxldF0gPSBjaGlsZDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbmV3IFVybFNlZ21lbnRHcm91cChzZWdtZW50R3JvdXAuc2VnbWVudHMsIGNoaWxkcmVuKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcmVmaXhlZFdpdGgoc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsIHN0YXJ0SW5kZXg6IG51bWJlciwgY29tbWFuZHM6IGFueVtdKSB7XG4gIGxldCBjdXJyZW50Q29tbWFuZEluZGV4ID0gMDtcbiAgbGV0IGN1cnJlbnRQYXRoSW5kZXggPSBzdGFydEluZGV4O1xuXG4gIGNvbnN0IG5vTWF0Y2ggPSB7bWF0Y2g6IGZhbHNlLCBwYXRoSW5kZXg6IDAsIGNvbW1hbmRJbmRleDogMH07XG4gIHdoaWxlIChjdXJyZW50UGF0aEluZGV4IDwgc2VnbWVudEdyb3VwLnNlZ21lbnRzLmxlbmd0aCkge1xuICAgIGlmIChjdXJyZW50Q29tbWFuZEluZGV4ID49IGNvbW1hbmRzLmxlbmd0aCkgcmV0dXJuIG5vTWF0Y2g7XG4gICAgY29uc3QgcGF0aCA9IHNlZ21lbnRHcm91cC5zZWdtZW50c1tjdXJyZW50UGF0aEluZGV4XTtcbiAgICBjb25zdCBjb21tYW5kID0gY29tbWFuZHNbY3VycmVudENvbW1hbmRJbmRleF07XG4gICAgLy8gRG8gbm90IHRyeSB0byBjb25zdW1lIGNvbW1hbmQgYXMgcGFydCBvZiB0aGUgcHJlZml4aW5nIGlmIGl0IGhhcyBvdXRsZXRzIGJlY2F1c2UgaXQgY2FuXG4gICAgLy8gY29udGFpbiBvdXRsZXRzIG90aGVyIHRoYW4gdGhlIG9uZSBiZWluZyBwcm9jZXNzZWQuIENvbnN1bWluZyB0aGUgb3V0bGV0cyBjb21tYW5kIHdvdWxkXG4gICAgLy8gcmVzdWx0IGluIG90aGVyIG91dGxldHMgYmVpbmcgaWdub3JlZC5cbiAgICBpZiAoaXNDb21tYW5kV2l0aE91dGxldHMoY29tbWFuZCkpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjb25zdCBjdXJyID0gYCR7Y29tbWFuZH1gO1xuICAgIGNvbnN0IG5leHQgPVxuICAgICAgICBjdXJyZW50Q29tbWFuZEluZGV4IDwgY29tbWFuZHMubGVuZ3RoIC0gMSA/IGNvbW1hbmRzW2N1cnJlbnRDb21tYW5kSW5kZXggKyAxXSA6IG51bGw7XG5cbiAgICBpZiAoY3VycmVudFBhdGhJbmRleCA+IDAgJiYgY3VyciA9PT0gdW5kZWZpbmVkKSBicmVhaztcblxuICAgIGlmIChjdXJyICYmIG5leHQgJiYgKHR5cGVvZiBuZXh0ID09PSAnb2JqZWN0JykgJiYgbmV4dC5vdXRsZXRzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICghY29tcGFyZShjdXJyLCBuZXh0LCBwYXRoKSkgcmV0dXJuIG5vTWF0Y2g7XG4gICAgICBjdXJyZW50Q29tbWFuZEluZGV4ICs9IDI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghY29tcGFyZShjdXJyLCB7fSwgcGF0aCkpIHJldHVybiBub01hdGNoO1xuICAgICAgY3VycmVudENvbW1hbmRJbmRleCsrO1xuICAgIH1cbiAgICBjdXJyZW50UGF0aEluZGV4Kys7XG4gIH1cblxuICByZXR1cm4ge21hdGNoOiB0cnVlLCBwYXRoSW5kZXg6IGN1cnJlbnRQYXRoSW5kZXgsIGNvbW1hbmRJbmRleDogY3VycmVudENvbW1hbmRJbmRleH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU5ld1NlZ21lbnRHcm91cChcbiAgICBzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCwgc3RhcnRJbmRleDogbnVtYmVyLCBjb21tYW5kczogYW55W10pOiBVcmxTZWdtZW50R3JvdXAge1xuICBjb25zdCBwYXRocyA9IHNlZ21lbnRHcm91cC5zZWdtZW50cy5zbGljZSgwLCBzdGFydEluZGV4KTtcblxuICBsZXQgaSA9IDA7XG4gIHdoaWxlIChpIDwgY29tbWFuZHMubGVuZ3RoKSB7XG4gICAgY29uc3QgY29tbWFuZCA9IGNvbW1hbmRzW2ldO1xuICAgIGlmIChpc0NvbW1hbmRXaXRoT3V0bGV0cyhjb21tYW5kKSkge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBjcmVhdGVOZXdTZWdtZW50Q2hpbGRyZW4oY29tbWFuZC5vdXRsZXRzKTtcbiAgICAgIHJldHVybiBuZXcgVXJsU2VnbWVudEdyb3VwKHBhdGhzLCBjaGlsZHJlbik7XG4gICAgfVxuXG4gICAgLy8gaWYgd2Ugc3RhcnQgd2l0aCBhbiBvYmplY3QgbGl0ZXJhbCwgd2UgbmVlZCB0byByZXVzZSB0aGUgcGF0aCBwYXJ0IGZyb20gdGhlIHNlZ21lbnRcbiAgICBpZiAoaSA9PT0gMCAmJiBpc01hdHJpeFBhcmFtcyhjb21tYW5kc1swXSkpIHtcbiAgICAgIGNvbnN0IHAgPSBzZWdtZW50R3JvdXAuc2VnbWVudHNbc3RhcnRJbmRleF07XG4gICAgICBwYXRocy5wdXNoKG5ldyBVcmxTZWdtZW50KHAucGF0aCwgc3RyaW5naWZ5KGNvbW1hbmRzWzBdKSkpO1xuICAgICAgaSsrO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3QgY3VyciA9IGlzQ29tbWFuZFdpdGhPdXRsZXRzKGNvbW1hbmQpID8gY29tbWFuZC5vdXRsZXRzW1BSSU1BUllfT1VUTEVUXSA6IGAke2NvbW1hbmR9YDtcbiAgICBjb25zdCBuZXh0ID0gKGkgPCBjb21tYW5kcy5sZW5ndGggLSAxKSA/IGNvbW1hbmRzW2kgKyAxXSA6IG51bGw7XG4gICAgaWYgKGN1cnIgJiYgbmV4dCAmJiBpc01hdHJpeFBhcmFtcyhuZXh0KSkge1xuICAgICAgcGF0aHMucHVzaChuZXcgVXJsU2VnbWVudChjdXJyLCBzdHJpbmdpZnkobmV4dCkpKTtcbiAgICAgIGkgKz0gMjtcbiAgICB9IGVsc2Uge1xuICAgICAgcGF0aHMucHVzaChuZXcgVXJsU2VnbWVudChjdXJyLCB7fSkpO1xuICAgICAgaSsrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbmV3IFVybFNlZ21lbnRHcm91cChwYXRocywge30pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVOZXdTZWdtZW50Q2hpbGRyZW4ob3V0bGV0czoge1tuYW1lOiBzdHJpbmddOiB1bmtub3duW118c3RyaW5nfSk6XG4gICAge1tvdXRsZXQ6IHN0cmluZ106IFVybFNlZ21lbnRHcm91cH0ge1xuICBjb25zdCBjaGlsZHJlbjoge1tvdXRsZXQ6IHN0cmluZ106IFVybFNlZ21lbnRHcm91cH0gPSB7fTtcbiAgZm9yRWFjaChvdXRsZXRzLCAoY29tbWFuZHMsIG91dGxldCkgPT4ge1xuICAgIGlmICh0eXBlb2YgY29tbWFuZHMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb21tYW5kcyA9IFtjb21tYW5kc107XG4gICAgfVxuICAgIGlmIChjb21tYW5kcyAhPT0gbnVsbCkge1xuICAgICAgY2hpbGRyZW5bb3V0bGV0XSA9IGNyZWF0ZU5ld1NlZ21lbnRHcm91cChuZXcgVXJsU2VnbWVudEdyb3VwKFtdLCB7fSksIDAsIGNvbW1hbmRzKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gY2hpbGRyZW47XG59XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeShwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KToge1trZXk6IHN0cmluZ106IHN0cmluZ30ge1xuICBjb25zdCByZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gIGZvckVhY2gocGFyYW1zLCAodjogYW55LCBrOiBzdHJpbmcpID0+IHJlc1trXSA9IGAke3Z9YCk7XG4gIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmUocGF0aDogc3RyaW5nLCBwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBzZWdtZW50OiBVcmxTZWdtZW50KTogYm9vbGVhbiB7XG4gIHJldHVybiBwYXRoID09IHNlZ21lbnQucGF0aCAmJiBzaGFsbG93RXF1YWwocGFyYW1zLCBzZWdtZW50LnBhcmFtZXRlcnMpO1xufVxuIl19
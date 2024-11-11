/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { AUTO_STYLE, NoopAnimationPlayer } from '@angular/animations';
import { ɵallowPreviousPlayerStylesMerge as allowPreviousPlayerStylesMerge, ɵcamelCaseToDashCase, ɵcontainsElement as containsElement, ɵgetParentElement as getParentElement, ɵinvokeQuery as invokeQuery, ɵnormalizeKeyframes as normalizeKeyframes, ɵvalidateStyleProperty as validateStyleProperty, ɵvalidateWebAnimatableStyleProperty, } from '@angular/animations/browser';
/**
 * @publicApi
 */
export class MockAnimationDriver {
    static { this.log = []; }
    validateStyleProperty(prop) {
        return validateStyleProperty(prop);
    }
    validateAnimatableStyleProperty(prop) {
        const cssProp = ɵcamelCaseToDashCase(prop);
        return ɵvalidateWebAnimatableStyleProperty(cssProp);
    }
    containsElement(elm1, elm2) {
        return containsElement(elm1, elm2);
    }
    getParentElement(element) {
        return getParentElement(element);
    }
    query(element, selector, multi) {
        return invokeQuery(element, selector, multi);
    }
    computeStyle(element, prop, defaultValue) {
        return defaultValue || '';
    }
    animate(element, keyframes, duration, delay, easing, previousPlayers = []) {
        const player = new MockAnimationPlayer(element, keyframes, duration, delay, easing, previousPlayers);
        MockAnimationDriver.log.push(player);
        return player;
    }
}
/**
 * @publicApi
 */
export class MockAnimationPlayer extends NoopAnimationPlayer {
    constructor(element, keyframes, duration, delay, easing, previousPlayers) {
        super(duration, delay);
        this.element = element;
        this.keyframes = keyframes;
        this.duration = duration;
        this.delay = delay;
        this.easing = easing;
        this.previousPlayers = previousPlayers;
        this.__finished = false;
        this.__started = false;
        this.previousStyles = new Map();
        this._onInitFns = [];
        this.currentSnapshot = new Map();
        this._keyframes = [];
        this._keyframes = normalizeKeyframes(keyframes);
        if (allowPreviousPlayerStylesMerge(duration, delay)) {
            previousPlayers.forEach((player) => {
                if (player instanceof MockAnimationPlayer) {
                    const styles = player.currentSnapshot;
                    styles.forEach((val, prop) => this.previousStyles.set(prop, val));
                }
            });
        }
    }
    /** @internal */
    onInit(fn) {
        this._onInitFns.push(fn);
    }
    /** @internal */
    init() {
        super.init();
        this._onInitFns.forEach((fn) => fn());
        this._onInitFns = [];
    }
    reset() {
        super.reset();
        this.__started = false;
    }
    finish() {
        super.finish();
        this.__finished = true;
    }
    destroy() {
        super.destroy();
        this.__finished = true;
    }
    /** @internal */
    triggerMicrotask() { }
    play() {
        super.play();
        this.__started = true;
    }
    hasStarted() {
        return this.__started;
    }
    beforeDestroy() {
        const captures = new Map();
        this.previousStyles.forEach((val, prop) => captures.set(prop, val));
        if (this.hasStarted()) {
            // when assembling the captured styles, it's important that
            // we build the keyframe styles in the following order:
            // {other styles within keyframes, ... previousStyles }
            this._keyframes.forEach((kf) => {
                for (let [prop, val] of kf) {
                    if (prop !== 'offset') {
                        captures.set(prop, this.__finished ? val : AUTO_STYLE);
                    }
                }
            });
        }
        this.currentSnapshot = captures;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19hbmltYXRpb25fZHJpdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3Rlc3Rpbmcvc3JjL21vY2tfYW5pbWF0aW9uX2RyaXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQWtCLFVBQVUsRUFBRSxtQkFBbUIsRUFBZ0IsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRyxPQUFPLEVBRUwsK0JBQStCLElBQUksOEJBQThCLEVBQ2pFLG9CQUFvQixFQUNwQixnQkFBZ0IsSUFBSSxlQUFlLEVBQ25DLGlCQUFpQixJQUFJLGdCQUFnQixFQUNyQyxZQUFZLElBQUksV0FBVyxFQUMzQixtQkFBbUIsSUFBSSxrQkFBa0IsRUFDekMsc0JBQXNCLElBQUkscUJBQXFCLEVBQy9DLG1DQUFtQyxHQUNwQyxNQUFNLDZCQUE2QixDQUFDO0FBRXJDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLG1CQUFtQjthQUN2QixRQUFHLEdBQXNCLEVBQUUsQ0FBQztJQUVuQyxxQkFBcUIsQ0FBQyxJQUFZO1FBQ2hDLE9BQU8scUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELCtCQUErQixDQUFDLElBQVk7UUFDMUMsTUFBTSxPQUFPLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0MsT0FBTyxtQ0FBbUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQsZUFBZSxDQUFDLElBQVMsRUFBRSxJQUFTO1FBQ2xDLE9BQU8sZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsZ0JBQWdCLENBQUMsT0FBZ0I7UUFDL0IsT0FBTyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQVksRUFBRSxR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cHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0aW9uUGxheWVyLCBBVVRPX1NUWUxFLCBOb29wQW5pbWF0aW9uUGxheWVyLCDJtVN0eWxlRGF0YU1hcH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge1xuICBBbmltYXRpb25Ecml2ZXIsXG4gIMm1YWxsb3dQcmV2aW91c1BsYXllclN0eWxlc01lcmdlIGFzIGFsbG93UHJldmlvdXNQbGF5ZXJTdHlsZXNNZXJnZSxcbiAgybVjYW1lbENhc2VUb0Rhc2hDYXNlLFxuICDJtWNvbnRhaW5zRWxlbWVudCBhcyBjb250YWluc0VsZW1lbnQsXG4gIMm1Z2V0UGFyZW50RWxlbWVudCBhcyBnZXRQYXJlbnRFbGVtZW50LFxuICDJtWludm9rZVF1ZXJ5IGFzIGludm9rZVF1ZXJ5LFxuICDJtW5vcm1hbGl6ZUtleWZyYW1lcyBhcyBub3JtYWxpemVLZXlmcmFtZXMsXG4gIMm1dmFsaWRhdGVTdHlsZVByb3BlcnR5IGFzIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eSxcbiAgybV2YWxpZGF0ZVdlYkFuaW1hdGFibGVTdHlsZVByb3BlcnR5LFxufSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zL2Jyb3dzZXInO1xuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE1vY2tBbmltYXRpb25Ecml2ZXIgaW1wbGVtZW50cyBBbmltYXRpb25Ecml2ZXIge1xuICBzdGF0aWMgbG9nOiBBbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuXG4gIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eShwcm9wOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3ApO1xuICB9XG5cbiAgdmFsaWRhdGVBbmltYXRhYmxlU3R5bGVQcm9wZXJ0eShwcm9wOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBjc3NQcm9wID0gybVjYW1lbENhc2VUb0Rhc2hDYXNlKHByb3ApO1xuICAgIHJldHVybiDJtXZhbGlkYXRlV2ViQW5pbWF0YWJsZVN0eWxlUHJvcGVydHkoY3NzUHJvcCk7XG4gIH1cblxuICBjb250YWluc0VsZW1lbnQoZWxtMTogYW55LCBlbG0yOiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gY29udGFpbnNFbGVtZW50KGVsbTEsIGVsbTIpO1xuICB9XG5cbiAgZ2V0UGFyZW50RWxlbWVudChlbGVtZW50OiB1bmtub3duKTogdW5rbm93biB7XG4gICAgcmV0dXJuIGdldFBhcmVudEVsZW1lbnQoZWxlbWVudCk7XG4gIH1cblxuICBxdWVyeShlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcsIG11bHRpOiBib29sZWFuKTogYW55W10ge1xuICAgIHJldHVybiBpbnZva2VRdWVyeShlbGVtZW50LCBzZWxlY3RvciwgbXVsdGkpO1xuICB9XG5cbiAgY29tcHV0ZVN0eWxlKGVsZW1lbnQ6IGFueSwgcHJvcDogc3RyaW5nLCBkZWZhdWx0VmFsdWU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgJyc7XG4gIH1cblxuICBhbmltYXRlKFxuICAgIGVsZW1lbnQ6IGFueSxcbiAgICBrZXlmcmFtZXM6IEFycmF5PMm1U3R5bGVEYXRhTWFwPixcbiAgICBkdXJhdGlvbjogbnVtYmVyLFxuICAgIGRlbGF5OiBudW1iZXIsXG4gICAgZWFzaW5nOiBzdHJpbmcsXG4gICAgcHJldmlvdXNQbGF5ZXJzOiBhbnlbXSA9IFtdLFxuICApOiBNb2NrQW5pbWF0aW9uUGxheWVyIHtcbiAgICBjb25zdCBwbGF5ZXIgPSBuZXcgTW9ja0FuaW1hdGlvblBsYXllcihcbiAgICAgIGVsZW1lbnQsXG4gICAgICBrZXlmcmFtZXMsXG4gICAgICBkdXJhdGlvbixcbiAgICAgIGRlbGF5LFxuICAgICAgZWFzaW5nLFxuICAgICAgcHJldmlvdXNQbGF5ZXJzLFxuICAgICk7XG4gICAgTW9ja0FuaW1hdGlvbkRyaXZlci5sb2cucHVzaCg8QW5pbWF0aW9uUGxheWVyPnBsYXllcik7XG4gICAgcmV0dXJuIHBsYXllcjtcbiAgfVxufVxuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE1vY2tBbmltYXRpb25QbGF5ZXIgZXh0ZW5kcyBOb29wQW5pbWF0aW9uUGxheWVyIHtcbiAgcHJpdmF0ZSBfX2ZpbmlzaGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX19zdGFydGVkID0gZmFsc2U7XG4gIHB1YmxpYyBwcmV2aW91c1N0eWxlczogybVTdHlsZURhdGFNYXAgPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgX29uSW5pdEZuczogKCgpID0+IGFueSlbXSA9IFtdO1xuICBwdWJsaWMgY3VycmVudFNuYXBzaG90OiDJtVN0eWxlRGF0YU1hcCA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBfa2V5ZnJhbWVzOiBBcnJheTzJtVN0eWxlRGF0YU1hcD4gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWxlbWVudDogYW55LFxuICAgIHB1YmxpYyBrZXlmcmFtZXM6IEFycmF5PMm1U3R5bGVEYXRhTWFwPixcbiAgICBwdWJsaWMgZHVyYXRpb246IG51bWJlcixcbiAgICBwdWJsaWMgZGVsYXk6IG51bWJlcixcbiAgICBwdWJsaWMgZWFzaW5nOiBzdHJpbmcsXG4gICAgcHVibGljIHByZXZpb3VzUGxheWVyczogYW55W10sXG4gICkge1xuICAgIHN1cGVyKGR1cmF0aW9uLCBkZWxheSk7XG5cbiAgICB0aGlzLl9rZXlmcmFtZXMgPSBub3JtYWxpemVLZXlmcmFtZXMoa2V5ZnJhbWVzKTtcblxuICAgIGlmIChhbGxvd1ByZXZpb3VzUGxheWVyU3R5bGVzTWVyZ2UoZHVyYXRpb24sIGRlbGF5KSkge1xuICAgICAgcHJldmlvdXNQbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4ge1xuICAgICAgICBpZiAocGxheWVyIGluc3RhbmNlb2YgTW9ja0FuaW1hdGlvblBsYXllcikge1xuICAgICAgICAgIGNvbnN0IHN0eWxlcyA9IHBsYXllci5jdXJyZW50U25hcHNob3Q7XG4gICAgICAgICAgc3R5bGVzLmZvckVhY2goKHZhbCwgcHJvcCkgPT4gdGhpcy5wcmV2aW91c1N0eWxlcy5zZXQocHJvcCwgdmFsKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb25Jbml0KGZuOiAoKSA9PiBhbnkpIHtcbiAgICB0aGlzLl9vbkluaXRGbnMucHVzaChmbik7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIGluaXQoKSB7XG4gICAgc3VwZXIuaW5pdCgpO1xuICAgIHRoaXMuX29uSW5pdEZucy5mb3JFYWNoKChmbikgPT4gZm4oKSk7XG4gICAgdGhpcy5fb25Jbml0Rm5zID0gW107XG4gIH1cblxuICBvdmVycmlkZSByZXNldCgpIHtcbiAgICBzdXBlci5yZXNldCgpO1xuICAgIHRoaXMuX19zdGFydGVkID0gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSBmaW5pc2goKTogdm9pZCB7XG4gICAgc3VwZXIuZmluaXNoKCk7XG4gICAgdGhpcy5fX2ZpbmlzaGVkID0gdHJ1ZTtcbiAgfVxuXG4gIG92ZXJyaWRlIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICAgIHRoaXMuX19maW5pc2hlZCA9IHRydWU7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHRyaWdnZXJNaWNyb3Rhc2soKSB7fVxuXG4gIG92ZXJyaWRlIHBsYXkoKTogdm9pZCB7XG4gICAgc3VwZXIucGxheSgpO1xuICAgIHRoaXMuX19zdGFydGVkID0gdHJ1ZTtcbiAgfVxuXG4gIG92ZXJyaWRlIGhhc1N0YXJ0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zdGFydGVkO1xuICB9XG5cbiAgYmVmb3JlRGVzdHJveSgpIHtcbiAgICBjb25zdCBjYXB0dXJlczogybVTdHlsZURhdGFNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLnByZXZpb3VzU3R5bGVzLmZvckVhY2goKHZhbCwgcHJvcCkgPT4gY2FwdHVyZXMuc2V0KHByb3AsIHZhbCkpO1xuXG4gICAgaWYgKHRoaXMuaGFzU3RhcnRlZCgpKSB7XG4gICAgICAvLyB3aGVuIGFzc2VtYmxpbmcgdGhlIGNhcHR1cmVkIHN0eWxlcywgaXQncyBpbXBvcnRhbnQgdGhhdFxuICAgICAgLy8gd2UgYnVpbGQgdGhlIGtleWZyYW1lIHN0eWxlcyBpbiB0aGUgZm9sbG93aW5nIG9yZGVyOlxuICAgICAgLy8ge290aGVyIHN0eWxlcyB3aXRoaW4ga2V5ZnJhbWVzLCAuLi4gcHJldmlvdXNTdHlsZXMgfVxuICAgICAgdGhpcy5fa2V5ZnJhbWVzLmZvckVhY2goKGtmKSA9PiB7XG4gICAgICAgIGZvciAobGV0IFtwcm9wLCB2YWxdIG9mIGtmKSB7XG4gICAgICAgICAgaWYgKHByb3AgIT09ICdvZmZzZXQnKSB7XG4gICAgICAgICAgICBjYXB0dXJlcy5zZXQocHJvcCwgdGhpcy5fX2ZpbmlzaGVkID8gdmFsIDogQVVUT19TVFlMRSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnRTbmFwc2hvdCA9IGNhcHR1cmVzO1xuICB9XG59XG4iXX0=
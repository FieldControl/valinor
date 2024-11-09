/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
    matchesElement(_element, _selector) {
        return false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19hbmltYXRpb25fZHJpdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3Rlc3Rpbmcvc3JjL21vY2tfYW5pbWF0aW9uX2RyaXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQWtCLFVBQVUsRUFBRSxtQkFBbUIsRUFBZ0IsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRyxPQUFPLEVBRUwsK0JBQStCLElBQUksOEJBQThCLEVBQ2pFLG9CQUFvQixFQUNwQixnQkFBZ0IsSUFBSSxlQUFlLEVBQ25DLGlCQUFpQixJQUFJLGdCQUFnQixFQUNyQyxZQUFZLElBQUksV0FBVyxFQUMzQixtQkFBbUIsSUFBSSxrQkFBa0IsRUFDekMsc0JBQXNCLElBQUkscUJBQXFCLEVBQy9DLG1DQUFtQyxHQUNwQyxNQUFNLDZCQUE2QixDQUFDO0FBRXJDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLG1CQUFtQjthQUN2QixRQUFHLEdBQXNCLEVBQUUsQ0FBQztJQUVuQyxxQkFBcUIsQ0FBQyxJQUFZO1FBQ2hDLE9BQU8scUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELCtCQUErQixDQUFDLElBQVk7UUFDMUMsTUFBTSxPQUFPLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0MsT0FBTyxtQ0FBbUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQsY0FBYyxDQUFDLFFBQWEsRUFBRSxTQUFpQjtRQUM3QyxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxlQUFlLENBQUMsSUFBUyxFQUFFLElBQVM7UUFDbEMsT0FBTyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxPQUFnQjtRQUMvQixPQUFPLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBWSxFQUFFLFFBQWdCLEVBQUUsS0FBYztRQUNsRCxPQUFPLFdBQVcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxZQUFZLENBQUMsT0FBWSxFQUFFLElBQVksRUFBRSxZQUFxQjtRQUM1RCxPQUFPLFlBQVksSUFBSSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVELE9BQU8sQ0FDTCxPQUFZLEVBQ1osU0FBK0IsRUFDL0IsUUFBZ0IsRUFDaEIsS0FBYSxFQUNiLE1BQWMsRUFDZCxrQkFBeUIsRUFBRTtRQUUzQixNQUFNLE1BQU0sR0FBRyxJQUFJLG1CQUFtQixDQUNwQyxPQUFPLEVBQ1AsU0FBUyxFQUNULFFBQVEsRUFDUixLQUFLLEVBQ0wsTUFBTSxFQUNOLGVBQWUsQ0FDaEIsQ0FBQztRQUNGLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQWtCLE1BQU0sQ0FBQyxDQUFDO1FBQ3RELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7O0FBR0g7O0dBRUc7QUFDSCxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsbUJBQW1CO0lBUTFELFlBQ1MsT0FBWSxFQUNaLFNBQStCLEVBQy9CLFFBQWdCLEVBQ2hCLEtBQWEsRUFDYixNQUFjLEVBQ2QsZUFBc0I7UUFFN0IsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQVBoQixZQUFPLEdBQVAsT0FBTyxDQUFLO1FBQ1osY0FBUyxHQUFULFNBQVMsQ0FBc0I7UUFDL0IsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUNoQixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQ2IsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLG9CQUFlLEdBQWYsZUFBZSxDQUFPO1FBYnZCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFDbkIsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUNuQixtQkFBYyxHQUFrQixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3pDLGVBQVUsR0FBa0IsRUFBRSxDQUFDO1FBQ2hDLG9CQUFlLEdBQWtCLElBQUksR0FBRyxFQUFFLENBQUM7UUFDMUMsZUFBVSxHQUF5QixFQUFFLENBQUM7UUFZNUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVoRCxJQUFJLDhCQUE4QixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3BELGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDakMsSUFBSSxNQUFNLFlBQVksbUJBQW1CLEVBQUUsQ0FBQztvQkFDMUMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQztvQkFDdEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNwRSxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztJQUVELGdCQUFnQjtJQUNoQixNQUFNLENBQUMsRUFBYTtRQUNsQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQsZ0JBQWdCO0lBQ1AsSUFBSTtRQUNYLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFUSxLQUFLO1FBQ1osS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2QsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDekIsQ0FBQztJQUVRLE1BQU07UUFDYixLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUN6QixDQUFDO0lBRVEsT0FBTztRQUNkLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUN6QixDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLGdCQUFnQixLQUFJLENBQUM7SUFFWixJQUFJO1FBQ1gsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDeEIsQ0FBQztJQUVRLFVBQVU7UUFDakIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxhQUFhO1FBQ1gsTUFBTSxRQUFRLEdBQWtCLElBQUksR0FBRyxFQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRXBFLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUM7WUFDdEIsMkRBQTJEO1lBQzNELHVEQUF1RDtZQUN2RCx1REFBdUQ7WUFDdkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtnQkFDN0IsS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO29CQUMzQixJQUFJLElBQUksS0FBSyxRQUFRLEVBQUUsQ0FBQzt3QkFDdEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDekQsQ0FBQztnQkFDSCxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUM7SUFDbEMsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvblBsYXllciwgQVVUT19TVFlMRSwgTm9vcEFuaW1hdGlvblBsYXllciwgybVTdHlsZURhdGFNYXB9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtcbiAgQW5pbWF0aW9uRHJpdmVyLFxuICDJtWFsbG93UHJldmlvdXNQbGF5ZXJTdHlsZXNNZXJnZSBhcyBhbGxvd1ByZXZpb3VzUGxheWVyU3R5bGVzTWVyZ2UsXG4gIMm1Y2FtZWxDYXNlVG9EYXNoQ2FzZSxcbiAgybVjb250YWluc0VsZW1lbnQgYXMgY29udGFpbnNFbGVtZW50LFxuICDJtWdldFBhcmVudEVsZW1lbnQgYXMgZ2V0UGFyZW50RWxlbWVudCxcbiAgybVpbnZva2VRdWVyeSBhcyBpbnZva2VRdWVyeSxcbiAgybVub3JtYWxpemVLZXlmcmFtZXMgYXMgbm9ybWFsaXplS2V5ZnJhbWVzLFxuICDJtXZhbGlkYXRlU3R5bGVQcm9wZXJ0eSBhcyB2YWxpZGF0ZVN0eWxlUHJvcGVydHksXG4gIMm1dmFsaWRhdGVXZWJBbmltYXRhYmxlU3R5bGVQcm9wZXJ0eSxcbn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucy9icm93c2VyJztcblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBNb2NrQW5pbWF0aW9uRHJpdmVyIGltcGxlbWVudHMgQW5pbWF0aW9uRHJpdmVyIHtcbiAgc3RhdGljIGxvZzogQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcblxuICB2YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eShwcm9wKTtcbiAgfVxuXG4gIHZhbGlkYXRlQW5pbWF0YWJsZVN0eWxlUHJvcGVydHkocHJvcDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgY3NzUHJvcCA9IMm1Y2FtZWxDYXNlVG9EYXNoQ2FzZShwcm9wKTtcbiAgICByZXR1cm4gybV2YWxpZGF0ZVdlYkFuaW1hdGFibGVTdHlsZVByb3BlcnR5KGNzc1Byb3ApO1xuICB9XG5cbiAgbWF0Y2hlc0VsZW1lbnQoX2VsZW1lbnQ6IGFueSwgX3NlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb250YWluc0VsZW1lbnQoZWxtMTogYW55LCBlbG0yOiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gY29udGFpbnNFbGVtZW50KGVsbTEsIGVsbTIpO1xuICB9XG5cbiAgZ2V0UGFyZW50RWxlbWVudChlbGVtZW50OiB1bmtub3duKTogdW5rbm93biB7XG4gICAgcmV0dXJuIGdldFBhcmVudEVsZW1lbnQoZWxlbWVudCk7XG4gIH1cblxuICBxdWVyeShlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcsIG11bHRpOiBib29sZWFuKTogYW55W10ge1xuICAgIHJldHVybiBpbnZva2VRdWVyeShlbGVtZW50LCBzZWxlY3RvciwgbXVsdGkpO1xuICB9XG5cbiAgY29tcHV0ZVN0eWxlKGVsZW1lbnQ6IGFueSwgcHJvcDogc3RyaW5nLCBkZWZhdWx0VmFsdWU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgJyc7XG4gIH1cblxuICBhbmltYXRlKFxuICAgIGVsZW1lbnQ6IGFueSxcbiAgICBrZXlmcmFtZXM6IEFycmF5PMm1U3R5bGVEYXRhTWFwPixcbiAgICBkdXJhdGlvbjogbnVtYmVyLFxuICAgIGRlbGF5OiBudW1iZXIsXG4gICAgZWFzaW5nOiBzdHJpbmcsXG4gICAgcHJldmlvdXNQbGF5ZXJzOiBhbnlbXSA9IFtdLFxuICApOiBNb2NrQW5pbWF0aW9uUGxheWVyIHtcbiAgICBjb25zdCBwbGF5ZXIgPSBuZXcgTW9ja0FuaW1hdGlvblBsYXllcihcbiAgICAgIGVsZW1lbnQsXG4gICAgICBrZXlmcmFtZXMsXG4gICAgICBkdXJhdGlvbixcbiAgICAgIGRlbGF5LFxuICAgICAgZWFzaW5nLFxuICAgICAgcHJldmlvdXNQbGF5ZXJzLFxuICAgICk7XG4gICAgTW9ja0FuaW1hdGlvbkRyaXZlci5sb2cucHVzaCg8QW5pbWF0aW9uUGxheWVyPnBsYXllcik7XG4gICAgcmV0dXJuIHBsYXllcjtcbiAgfVxufVxuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE1vY2tBbmltYXRpb25QbGF5ZXIgZXh0ZW5kcyBOb29wQW5pbWF0aW9uUGxheWVyIHtcbiAgcHJpdmF0ZSBfX2ZpbmlzaGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX19zdGFydGVkID0gZmFsc2U7XG4gIHB1YmxpYyBwcmV2aW91c1N0eWxlczogybVTdHlsZURhdGFNYXAgPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgX29uSW5pdEZuczogKCgpID0+IGFueSlbXSA9IFtdO1xuICBwdWJsaWMgY3VycmVudFNuYXBzaG90OiDJtVN0eWxlRGF0YU1hcCA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBfa2V5ZnJhbWVzOiBBcnJheTzJtVN0eWxlRGF0YU1hcD4gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWxlbWVudDogYW55LFxuICAgIHB1YmxpYyBrZXlmcmFtZXM6IEFycmF5PMm1U3R5bGVEYXRhTWFwPixcbiAgICBwdWJsaWMgZHVyYXRpb246IG51bWJlcixcbiAgICBwdWJsaWMgZGVsYXk6IG51bWJlcixcbiAgICBwdWJsaWMgZWFzaW5nOiBzdHJpbmcsXG4gICAgcHVibGljIHByZXZpb3VzUGxheWVyczogYW55W10sXG4gICkge1xuICAgIHN1cGVyKGR1cmF0aW9uLCBkZWxheSk7XG5cbiAgICB0aGlzLl9rZXlmcmFtZXMgPSBub3JtYWxpemVLZXlmcmFtZXMoa2V5ZnJhbWVzKTtcblxuICAgIGlmIChhbGxvd1ByZXZpb3VzUGxheWVyU3R5bGVzTWVyZ2UoZHVyYXRpb24sIGRlbGF5KSkge1xuICAgICAgcHJldmlvdXNQbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4ge1xuICAgICAgICBpZiAocGxheWVyIGluc3RhbmNlb2YgTW9ja0FuaW1hdGlvblBsYXllcikge1xuICAgICAgICAgIGNvbnN0IHN0eWxlcyA9IHBsYXllci5jdXJyZW50U25hcHNob3Q7XG4gICAgICAgICAgc3R5bGVzLmZvckVhY2goKHZhbCwgcHJvcCkgPT4gdGhpcy5wcmV2aW91c1N0eWxlcy5zZXQocHJvcCwgdmFsKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb25Jbml0KGZuOiAoKSA9PiBhbnkpIHtcbiAgICB0aGlzLl9vbkluaXRGbnMucHVzaChmbik7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIGluaXQoKSB7XG4gICAgc3VwZXIuaW5pdCgpO1xuICAgIHRoaXMuX29uSW5pdEZucy5mb3JFYWNoKChmbikgPT4gZm4oKSk7XG4gICAgdGhpcy5fb25Jbml0Rm5zID0gW107XG4gIH1cblxuICBvdmVycmlkZSByZXNldCgpIHtcbiAgICBzdXBlci5yZXNldCgpO1xuICAgIHRoaXMuX19zdGFydGVkID0gZmFsc2U7XG4gIH1cblxuICBvdmVycmlkZSBmaW5pc2goKTogdm9pZCB7XG4gICAgc3VwZXIuZmluaXNoKCk7XG4gICAgdGhpcy5fX2ZpbmlzaGVkID0gdHJ1ZTtcbiAgfVxuXG4gIG92ZXJyaWRlIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICAgIHRoaXMuX19maW5pc2hlZCA9IHRydWU7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHRyaWdnZXJNaWNyb3Rhc2soKSB7fVxuXG4gIG92ZXJyaWRlIHBsYXkoKTogdm9pZCB7XG4gICAgc3VwZXIucGxheSgpO1xuICAgIHRoaXMuX19zdGFydGVkID0gdHJ1ZTtcbiAgfVxuXG4gIG92ZXJyaWRlIGhhc1N0YXJ0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zdGFydGVkO1xuICB9XG5cbiAgYmVmb3JlRGVzdHJveSgpIHtcbiAgICBjb25zdCBjYXB0dXJlczogybVTdHlsZURhdGFNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLnByZXZpb3VzU3R5bGVzLmZvckVhY2goKHZhbCwgcHJvcCkgPT4gY2FwdHVyZXMuc2V0KHByb3AsIHZhbCkpO1xuXG4gICAgaWYgKHRoaXMuaGFzU3RhcnRlZCgpKSB7XG4gICAgICAvLyB3aGVuIGFzc2VtYmxpbmcgdGhlIGNhcHR1cmVkIHN0eWxlcywgaXQncyBpbXBvcnRhbnQgdGhhdFxuICAgICAgLy8gd2UgYnVpbGQgdGhlIGtleWZyYW1lIHN0eWxlcyBpbiB0aGUgZm9sbG93aW5nIG9yZGVyOlxuICAgICAgLy8ge290aGVyIHN0eWxlcyB3aXRoaW4ga2V5ZnJhbWVzLCAuLi4gcHJldmlvdXNTdHlsZXMgfVxuICAgICAgdGhpcy5fa2V5ZnJhbWVzLmZvckVhY2goKGtmKSA9PiB7XG4gICAgICAgIGZvciAobGV0IFtwcm9wLCB2YWxdIG9mIGtmKSB7XG4gICAgICAgICAgaWYgKHByb3AgIT09ICdvZmZzZXQnKSB7XG4gICAgICAgICAgICBjYXB0dXJlcy5zZXQocHJvcCwgdGhpcy5fX2ZpbmlzaGVkID8gdmFsIDogQVVUT19TVFlMRSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnRTbmFwc2hvdCA9IGNhcHR1cmVzO1xuICB9XG59XG4iXX0=
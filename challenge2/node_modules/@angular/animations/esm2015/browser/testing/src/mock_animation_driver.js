/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AUTO_STYLE, NoopAnimationPlayer } from '@angular/animations';
import { ɵallowPreviousPlayerStylesMerge as allowPreviousPlayerStylesMerge, ɵcontainsElement as containsElement, ɵinvokeQuery as invokeQuery, ɵmatchesElement as matchesElement, ɵvalidateStyleProperty as validateStyleProperty } from '@angular/animations/browser';
/**
 * @publicApi
 */
export class MockAnimationDriver {
    validateStyleProperty(prop) {
        return validateStyleProperty(prop);
    }
    matchesElement(element, selector) {
        return matchesElement(element, selector);
    }
    containsElement(elm1, elm2) {
        return containsElement(elm1, elm2);
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
MockAnimationDriver.log = [];
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
        this.previousStyles = {};
        this._onInitFns = [];
        this.currentSnapshot = {};
        if (allowPreviousPlayerStylesMerge(duration, delay)) {
            previousPlayers.forEach(player => {
                if (player instanceof MockAnimationPlayer) {
                    const styles = player.currentSnapshot;
                    Object.keys(styles).forEach(prop => this.previousStyles[prop] = styles[prop]);
                }
            });
        }
    }
    /* @internal */
    onInit(fn) {
        this._onInitFns.push(fn);
    }
    /* @internal */
    init() {
        super.init();
        this._onInitFns.forEach(fn => fn());
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
    /* @internal */
    triggerMicrotask() { }
    play() {
        super.play();
        this.__started = true;
    }
    hasStarted() {
        return this.__started;
    }
    beforeDestroy() {
        const captures = {};
        Object.keys(this.previousStyles).forEach(prop => {
            captures[prop] = this.previousStyles[prop];
        });
        if (this.hasStarted()) {
            // when assembling the captured styles, it's important that
            // we build the keyframe styles in the following order:
            // {other styles within keyframes, ... previousStyles }
            this.keyframes.forEach(kf => {
                Object.keys(kf).forEach(prop => {
                    if (prop != 'offset') {
                        captures[prop] = this.__finished ? kf[prop] : AUTO_STYLE;
                    }
                });
            });
        }
        this.currentSnapshot = captures;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19hbmltYXRpb25fZHJpdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3Rlc3Rpbmcvc3JjL21vY2tfYW5pbWF0aW9uX2RyaXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQWtCLFVBQVUsRUFBRSxtQkFBbUIsRUFBYSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pHLE9BQU8sRUFBa0IsK0JBQStCLElBQUksOEJBQThCLEVBQUUsZ0JBQWdCLElBQUksZUFBZSxFQUFFLFlBQVksSUFBSSxXQUFXLEVBQUUsZUFBZSxJQUFJLGNBQWMsRUFBRSxzQkFBc0IsSUFBSSxxQkFBcUIsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBR3JSOztHQUVHO0FBQ0gsTUFBTSxPQUFPLG1CQUFtQjtJQUc5QixxQkFBcUIsQ0FBQyxJQUFZO1FBQ2hDLE9BQU8scUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELGNBQWMsQ0FBQyxPQUFZLEVBQUUsUUFBZ0I7UUFDM0MsT0FBTyxjQUFjLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCxlQUFlLENBQUMsSUFBUyxFQUFFLElBQVM7UUFDbEMsT0FBTyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBWSxFQUFFLFFBQWdCLEVBQUUsS0FBYztRQUNsRCxPQUFPLFdBQVcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxZQUFZLENBQUMsT0FBWSxFQUFFLElBQVksRUFBRSxZQUFxQjtRQUM1RCxPQUFPLFlBQVksSUFBSSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVELE9BQU8sQ0FDSCxPQUFZLEVBQUUs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aEMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzlDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDckIsMkRBQTJEO1lBQzNELHVEQUF1RDtZQUN2RCx1REFBdUQ7WUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUM3QixJQUFJLElBQUksSUFBSSxRQUFRLEVBQUU7d0JBQ3BCLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztxQkFDMUQ7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztTQUNKO1FBRUQsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUM7SUFDbEMsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvblBsYXllciwgQVVUT19TVFlMRSwgTm9vcEFuaW1hdGlvblBsYXllciwgybVTdHlsZURhdGF9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtBbmltYXRpb25Ecml2ZXIsIMm1YWxsb3dQcmV2aW91c1BsYXllclN0eWxlc01lcmdlIGFzIGFsbG93UHJldmlvdXNQbGF5ZXJTdHlsZXNNZXJnZSwgybVjb250YWluc0VsZW1lbnQgYXMgY29udGFpbnNFbGVtZW50LCDJtWludm9rZVF1ZXJ5IGFzIGludm9rZVF1ZXJ5LCDJtW1hdGNoZXNFbGVtZW50IGFzIG1hdGNoZXNFbGVtZW50LCDJtXZhbGlkYXRlU3R5bGVQcm9wZXJ0eSBhcyB2YWxpZGF0ZVN0eWxlUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMvYnJvd3Nlcic7XG5cblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBNb2NrQW5pbWF0aW9uRHJpdmVyIGltcGxlbWVudHMgQW5pbWF0aW9uRHJpdmVyIHtcbiAgc3RhdGljIGxvZzogQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcblxuICB2YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eShwcm9wKTtcbiAgfVxuXG4gIG1hdGNoZXNFbGVtZW50KGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBtYXRjaGVzRWxlbWVudChlbGVtZW50LCBzZWxlY3Rvcik7XG4gIH1cblxuICBjb250YWluc0VsZW1lbnQoZWxtMTogYW55LCBlbG0yOiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gY29udGFpbnNFbGVtZW50KGVsbTEsIGVsbTIpO1xuICB9XG5cbiAgcXVlcnkoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbik6IGFueVtdIHtcbiAgICByZXR1cm4gaW52b2tlUXVlcnkoZWxlbWVudCwgc2VsZWN0b3IsIG11bHRpKTtcbiAgfVxuXG4gIGNvbXB1dGVTdHlsZShlbGVtZW50OiBhbnksIHByb3A6IHN0cmluZywgZGVmYXVsdFZhbHVlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlIHx8ICcnO1xuICB9XG5cbiAgYW5pbWF0ZShcbiAgICAgIGVsZW1lbnQ6IGFueSwga2V5ZnJhbWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfG51bWJlcn1bXSwgZHVyYXRpb246IG51bWJlciwgZGVsYXk6IG51bWJlcixcbiAgICAgIGVhc2luZzogc3RyaW5nLCBwcmV2aW91c1BsYXllcnM6IGFueVtdID0gW10pOiBNb2NrQW5pbWF0aW9uUGxheWVyIHtcbiAgICBjb25zdCBwbGF5ZXIgPVxuICAgICAgICBuZXcgTW9ja0FuaW1hdGlvblBsYXllcihlbGVtZW50LCBrZXlmcmFtZXMsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBwcmV2aW91c1BsYXllcnMpO1xuICAgIE1vY2tBbmltYXRpb25Ecml2ZXIubG9nLnB1c2goPEFuaW1hdGlvblBsYXllcj5wbGF5ZXIpO1xuICAgIHJldHVybiBwbGF5ZXI7XG4gIH1cbn1cblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBNb2NrQW5pbWF0aW9uUGxheWVyIGV4dGVuZHMgTm9vcEFuaW1hdGlvblBsYXllciB7XG4gIHByaXZhdGUgX19maW5pc2hlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9fc3RhcnRlZCA9IGZhbHNlO1xuICBwdWJsaWMgcHJldmlvdXNTdHlsZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd8bnVtYmVyfSA9IHt9O1xuICBwcml2YXRlIF9vbkluaXRGbnM6ICgoKSA9PiBhbnkpW10gPSBbXTtcbiAgcHVibGljIGN1cnJlbnRTbmFwc2hvdDogybVTdHlsZURhdGEgPSB7fTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBlbGVtZW50OiBhbnksIHB1YmxpYyBrZXlmcmFtZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd8bnVtYmVyfVtdLFxuICAgICAgcHVibGljIGR1cmF0aW9uOiBudW1iZXIsIHB1YmxpYyBkZWxheTogbnVtYmVyLCBwdWJsaWMgZWFzaW5nOiBzdHJpbmcsXG4gICAgICBwdWJsaWMgcHJldmlvdXNQbGF5ZXJzOiBhbnlbXSkge1xuICAgIHN1cGVyKGR1cmF0aW9uLCBkZWxheSk7XG5cbiAgICBpZiAoYWxsb3dQcmV2aW91c1BsYXllclN0eWxlc01lcmdlKGR1cmF0aW9uLCBkZWxheSkpIHtcbiAgICAgIHByZXZpb3VzUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgIGlmIChwbGF5ZXIgaW5zdGFuY2VvZiBNb2NrQW5pbWF0aW9uUGxheWVyKSB7XG4gICAgICAgICAgY29uc3Qgc3R5bGVzID0gcGxheWVyLmN1cnJlbnRTbmFwc2hvdDtcbiAgICAgICAgICBPYmplY3Qua2V5cyhzdHlsZXMpLmZvckVhY2gocHJvcCA9PiB0aGlzLnByZXZpb3VzU3R5bGVzW3Byb3BdID0gc3R5bGVzW3Byb3BdKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyogQGludGVybmFsICovXG4gIG9uSW5pdChmbjogKCkgPT4gYW55KSB7XG4gICAgdGhpcy5fb25Jbml0Rm5zLnB1c2goZm4pO1xuICB9XG5cbiAgLyogQGludGVybmFsICovXG4gIGluaXQoKSB7XG4gICAgc3VwZXIuaW5pdCgpO1xuICAgIHRoaXMuX29uSW5pdEZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIHRoaXMuX29uSW5pdEZucyA9IFtdO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgc3VwZXIucmVzZXQoKTtcbiAgICB0aGlzLl9fc3RhcnRlZCA9IGZhbHNlO1xuICB9XG5cbiAgZmluaXNoKCk6IHZvaWQge1xuICAgIHN1cGVyLmZpbmlzaCgpO1xuICAgIHRoaXMuX19maW5pc2hlZCA9IHRydWU7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9fZmluaXNoZWQgPSB0cnVlO1xuICB9XG5cbiAgLyogQGludGVybmFsICovXG4gIHRyaWdnZXJNaWNyb3Rhc2soKSB7fVxuXG4gIHBsYXkoKTogdm9pZCB7XG4gICAgc3VwZXIucGxheSgpO1xuICAgIHRoaXMuX19zdGFydGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGhhc1N0YXJ0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zdGFydGVkO1xuICB9XG5cbiAgYmVmb3JlRGVzdHJveSgpIHtcbiAgICBjb25zdCBjYXB0dXJlczogybVTdHlsZURhdGEgPSB7fTtcblxuICAgIE9iamVjdC5rZXlzKHRoaXMucHJldmlvdXNTdHlsZXMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBjYXB0dXJlc1twcm9wXSA9IHRoaXMucHJldmlvdXNTdHlsZXNbcHJvcF07XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5oYXNTdGFydGVkKCkpIHtcbiAgICAgIC8vIHdoZW4gYXNzZW1ibGluZyB0aGUgY2FwdHVyZWQgc3R5bGVzLCBpdCdzIGltcG9ydGFudCB0aGF0XG4gICAgICAvLyB3ZSBidWlsZCB0aGUga2V5ZnJhbWUgc3R5bGVzIGluIHRoZSBmb2xsb3dpbmcgb3JkZXI6XG4gICAgICAvLyB7b3RoZXIgc3R5bGVzIHdpdGhpbiBrZXlmcmFtZXMsIC4uLiBwcmV2aW91c1N0eWxlcyB9XG4gICAgICB0aGlzLmtleWZyYW1lcy5mb3JFYWNoKGtmID0+IHtcbiAgICAgICAgT2JqZWN0LmtleXMoa2YpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgICAgaWYgKHByb3AgIT0gJ29mZnNldCcpIHtcbiAgICAgICAgICAgIGNhcHR1cmVzW3Byb3BdID0gdGhpcy5fX2ZpbmlzaGVkID8ga2ZbcHJvcF0gOiBBVVRPX1NUWUxFO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnRTbmFwc2hvdCA9IGNhcHR1cmVzO1xuICB9XG59XG4iXX0=
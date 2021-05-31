/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { animate, state, style, transition, trigger, } from '@angular/animations';
/**
 * Animations used by the Material drawers.
 * @docs-private
 */
export const matDrawerAnimations = {
    /** Animation that slides a drawer in and out. */
    transformDrawer: trigger('transform', [
        // We remove the `transform` here completely, rather than setting it to zero, because:
        // 1. Having a transform can cause elements with ripples or an animated
        //    transform to shift around in Chrome with an RTL layout (see #10023).
        // 2. 3d transforms causes text to appear blurry on IE and Edge.
        state('open, open-instant', style({
            'transform': 'none',
            'visibility': 'visible',
        })),
        state('void', style({
            // Avoids the shadow showing up when closed in SSR.
            'box-shadow': 'none',
            'visibility': 'hidden',
        })),
        transition('void => open-instant', animate('0ms')),
        transition('void <=> open, open-instant => void', animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)'))
    ])
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhd2VyLWFuaW1hdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2lkZW5hdi9kcmF3ZXItYW5pbWF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQ0wsT0FBTyxFQUNQLEtBQUssRUFDTCxLQUFLLEVBQ0wsVUFBVSxFQUNWLE9BQU8sR0FFUixNQUFNLHFCQUFxQixDQUFDO0FBRTdCOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUU1QjtJQUNGLGlEQUFpRDtJQUNqRCxlQUFlLEVBQUUsT0FBTyxDQUFDLFdBQVcsRUFBRTtRQUNwQyxzRkFBc0Y7UUFDdEYsdUVBQXVFO1FBQ3ZFLDBFQUEwRTtRQUMxRSxnRUFBZ0U7UUFDaEUsS0FBSyxDQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQztZQUNoQyxXQUFXLEVBQUUsTUFBTTtZQUNuQixZQUFZLEVBQUUsU0FBUztTQUN4QixDQUFDLENBQUM7UUFDSCxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQztZQUNsQixtREFBbUQ7WUFDbkQsWUFBWSxFQUFFLE1BQU07WUFDcEIsWUFBWSxFQUFFLFFBQVE7U0FDdkIsQ0FBQyxDQUFDO1FBQ0gsVUFBVSxDQUFDLHNCQUFzQixFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsRCxVQUFVLENBQUMscUNBQXFDLEVBQzVDLE9BQU8sQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0tBQ3ZELENBQUM7Q0FDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1xuICBhbmltYXRlLFxuICBzdGF0ZSxcbiAgc3R5bGUsXG4gIHRyYW5zaXRpb24sXG4gIHRyaWdnZXIsXG4gIEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YSxcbn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbi8qKlxuICogQW5pbWF0aW9ucyB1c2VkIGJ5IHRoZSBNYXRlcmlhbCBkcmF3ZXJzLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgbWF0RHJhd2VyQW5pbWF0aW9uczoge1xuICByZWFkb25seSB0cmFuc2Zvcm1EcmF3ZXI6IEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YTtcbn0gPSB7XG4gIC8qKiBBbmltYXRpb24gdGhhdCBzbGlkZXMgYSBkcmF3ZXIgaW4gYW5kIG91dC4gKi9cbiAgdHJhbnNmb3JtRHJhd2VyOiB0cmlnZ2VyKCd0cmFuc2Zvcm0nLCBbXG4gICAgLy8gV2UgcmVtb3ZlIHRoZSBgdHJhbnNmb3JtYCBoZXJlIGNvbXBsZXRlbHksIHJhdGhlciB0aGFuIHNldHRpbmcgaXQgdG8gemVybywgYmVjYXVzZTpcbiAgICAvLyAxLiBIYXZpbmcgYSB0cmFuc2Zvcm0gY2FuIGNhdXNlIGVsZW1lbnRzIHdpdGggcmlwcGxlcyBvciBhbiBhbmltYXRlZFxuICAgIC8vICAgIHRyYW5zZm9ybSB0byBzaGlmdCBhcm91bmQgaW4gQ2hyb21lIHdpdGggYW4gUlRMIGxheW91dCAoc2VlICMxMDAyMykuXG4gICAgLy8gMi4gM2QgdHJhbnNmb3JtcyBjYXVzZXMgdGV4dCB0byBhcHBlYXIgYmx1cnJ5IG9uIElFIGFuZCBFZGdlLlxuICAgIHN0YXRlKCdvcGVuLCBvcGVuLWluc3RhbnQnLCBzdHlsZSh7XG4gICAgICAndHJhbnNmb3JtJzogJ25vbmUnLFxuICAgICAgJ3Zpc2liaWxpdHknOiAndmlzaWJsZScsXG4gICAgfSkpLFxuICAgIHN0YXRlKCd2b2lkJywgc3R5bGUoe1xuICAgICAgLy8gQXZvaWRzIHRoZSBzaGFkb3cgc2hvd2luZyB1cCB3aGVuIGNsb3NlZCBpbiBTU1IuXG4gICAgICAnYm94LXNoYWRvdyc6ICdub25lJyxcbiAgICAgICd2aXNpYmlsaXR5JzogJ2hpZGRlbicsXG4gICAgfSkpLFxuICAgIHRyYW5zaXRpb24oJ3ZvaWQgPT4gb3Blbi1pbnN0YW50JywgYW5pbWF0ZSgnMG1zJykpLFxuICAgIHRyYW5zaXRpb24oJ3ZvaWQgPD0+IG9wZW4sIG9wZW4taW5zdGFudCA9PiB2b2lkJyxcbiAgICAgICAgYW5pbWF0ZSgnNDAwbXMgY3ViaWMtYmV6aWVyKDAuMjUsIDAuOCwgMC4yNSwgMSknKSlcbiAgXSlcbn07XG4iXX0=
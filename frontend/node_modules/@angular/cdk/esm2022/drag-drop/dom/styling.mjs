/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Shallow-extends a stylesheet object with another stylesheet-like object.
 * Note that the keys in `source` have to be dash-cased.
 * @docs-private
 */
export function extendStyles(dest, source, importantProperties) {
    for (let key in source) {
        if (source.hasOwnProperty(key)) {
            const value = source[key];
            if (value) {
                dest.setProperty(key, value, importantProperties?.has(key) ? 'important' : '');
            }
            else {
                dest.removeProperty(key);
            }
        }
    }
    return dest;
}
/**
 * Toggles whether the native drag interactions should be enabled for an element.
 * @param element Element on which to toggle the drag interactions.
 * @param enable Whether the drag interactions should be enabled.
 * @docs-private
 */
export function toggleNativeDragInteractions(element, enable) {
    const userSelect = enable ? '' : 'none';
    extendStyles(element.style, {
        'touch-action': enable ? '' : 'none',
        '-webkit-user-drag': enable ? '' : 'none',
        '-webkit-tap-highlight-color': enable ? '' : 'transparent',
        'user-select': userSelect,
        '-ms-user-select': userSelect,
        '-webkit-user-select': userSelect,
        '-moz-user-select': userSelect,
    });
}
/**
 * Toggles whether an element is visible while preserving its dimensions.
 * @param element Element whose visibility to toggle
 * @param enable Whether the element should be visible.
 * @param importantProperties Properties to be set as `!important`.
 * @docs-private
 */
export function toggleVisibility(element, enable, importantProperties) {
    extendStyles(element.style, {
        position: enable ? '' : 'fixed',
        top: enable ? '' : '0',
        opacity: enable ? '' : '0',
        left: enable ? '' : '-999em',
    }, importantProperties);
}
/**
 * Combines a transform string with an optional other transform
 * that exited before the base transform was applied.
 */
export function combineTransforms(transform, initialTransform) {
    return initialTransform && initialTransform != 'none'
        ? transform + ' ' + initialTransform
        : transform;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvZHJhZy1kcm9wL2RvbS9zdHlsaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQVlIOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsWUFBWSxDQUMxQixJQUF5QixFQUN6QixNQUE4QixFQUM5QixtQkFBaUM7SUFFakMsS0FBSyxJQUFJLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUN2QixJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUMvQixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFMUIsSUFBSSxLQUFLLEVBQUUsQ0FBQztnQkFDVixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pGLENBQUM7aUJBQU0sQ0FBQztnQkFDTixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLDRCQUE0QixDQUFDLE9BQW9CLEVBQUUsTUFBZTtJQUNoRixNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBRXhDLFlBQVksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO1FBQzFCLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTTtRQUNwQyxtQkFBbUIsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTTtRQUN6Qyw2QkFBNkIsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYTtRQUMxRCxhQUFhLEVBQUUsVUFBVTtRQUN6QixpQkFBaUIsRUFBRSxVQUFVO1FBQzdCLHFCQUFxQixFQUFFLFVBQVU7UUFDakMsa0JBQWtCLEVBQUUsVUFBVTtLQUMvQixDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLGdCQUFnQixDQUM5QixPQUFvQixFQUNwQixNQUFlLEVBQ2YsbUJBQWlDO0lBRWpDLFlBQVksQ0FDVixPQUFPLENBQUMsS0FBSyxFQUNiO1FBQ0UsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPO1FBQy9CLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRztRQUN0QixPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUc7UUFDMUIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRO0tBQzdCLEVBQ0QsbUJBQW1CLENBQ3BCLENBQUM7QUFDSixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLGlCQUFpQixDQUFDLFNBQWlCLEVBQUUsZ0JBQXlCO0lBQzVFLE9BQU8sZ0JBQWdCLElBQUksZ0JBQWdCLElBQUksTUFBTTtRQUNuRCxDQUFDLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyxnQkFBZ0I7UUFDcEMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogRXh0ZW5kZWQgQ1NTU3R5bGVEZWNsYXJhdGlvbiB0aGF0IGluY2x1ZGVzIGEgY291cGxlIG9mIGRyYWctcmVsYXRlZFxuICogcHJvcGVydGllcyB0aGF0IGFyZW4ndCBpbiB0aGUgYnVpbHQtaW4gVFMgdHlwaW5ncy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEcmFnQ1NTU3R5bGVEZWNsYXJhdGlvbiBleHRlbmRzIENTU1N0eWxlRGVjbGFyYXRpb24ge1xuICBtc1Njcm9sbFNuYXBUeXBlOiBzdHJpbmc7XG4gIHNjcm9sbFNuYXBUeXBlOiBzdHJpbmc7XG4gIHdlYmtpdFRhcEhpZ2hsaWdodENvbG9yOiBzdHJpbmc7XG59XG5cbi8qKlxuICogU2hhbGxvdy1leHRlbmRzIGEgc3R5bGVzaGVldCBvYmplY3Qgd2l0aCBhbm90aGVyIHN0eWxlc2hlZXQtbGlrZSBvYmplY3QuXG4gKiBOb3RlIHRoYXQgdGhlIGtleXMgaW4gYHNvdXJjZWAgaGF2ZSB0byBiZSBkYXNoLWNhc2VkLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kU3R5bGVzKFxuICBkZXN0OiBDU1NTdHlsZURlY2xhcmF0aW9uLFxuICBzb3VyY2U6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4sXG4gIGltcG9ydGFudFByb3BlcnRpZXM/OiBTZXQ8c3RyaW5nPixcbikge1xuICBmb3IgKGxldCBrZXkgaW4gc291cmNlKSB7XG4gICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHNvdXJjZVtrZXldO1xuXG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgZGVzdC5zZXRQcm9wZXJ0eShrZXksIHZhbHVlLCBpbXBvcnRhbnRQcm9wZXJ0aWVzPy5oYXMoa2V5KSA/ICdpbXBvcnRhbnQnIDogJycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVzdC5yZW1vdmVQcm9wZXJ0eShrZXkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkZXN0O1xufVxuXG4vKipcbiAqIFRvZ2dsZXMgd2hldGhlciB0aGUgbmF0aXZlIGRyYWcgaW50ZXJhY3Rpb25zIHNob3VsZCBiZSBlbmFibGVkIGZvciBhbiBlbGVtZW50LlxuICogQHBhcmFtIGVsZW1lbnQgRWxlbWVudCBvbiB3aGljaCB0byB0b2dnbGUgdGhlIGRyYWcgaW50ZXJhY3Rpb25zLlxuICogQHBhcmFtIGVuYWJsZSBXaGV0aGVyIHRoZSBkcmFnIGludGVyYWN0aW9ucyBzaG91bGQgYmUgZW5hYmxlZC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZU5hdGl2ZURyYWdJbnRlcmFjdGlvbnMoZWxlbWVudDogSFRNTEVsZW1lbnQsIGVuYWJsZTogYm9vbGVhbikge1xuICBjb25zdCB1c2VyU2VsZWN0ID0gZW5hYmxlID8gJycgOiAnbm9uZSc7XG5cbiAgZXh0ZW5kU3R5bGVzKGVsZW1lbnQuc3R5bGUsIHtcbiAgICAndG91Y2gtYWN0aW9uJzogZW5hYmxlID8gJycgOiAnbm9uZScsXG4gICAgJy13ZWJraXQtdXNlci1kcmFnJzogZW5hYmxlID8gJycgOiAnbm9uZScsXG4gICAgJy13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcic6IGVuYWJsZSA/ICcnIDogJ3RyYW5zcGFyZW50JyxcbiAgICAndXNlci1zZWxlY3QnOiB1c2VyU2VsZWN0LFxuICAgICctbXMtdXNlci1zZWxlY3QnOiB1c2VyU2VsZWN0LFxuICAgICctd2Via2l0LXVzZXItc2VsZWN0JzogdXNlclNlbGVjdCxcbiAgICAnLW1vei11c2VyLXNlbGVjdCc6IHVzZXJTZWxlY3QsXG4gIH0pO1xufVxuXG4vKipcbiAqIFRvZ2dsZXMgd2hldGhlciBhbiBlbGVtZW50IGlzIHZpc2libGUgd2hpbGUgcHJlc2VydmluZyBpdHMgZGltZW5zaW9ucy5cbiAqIEBwYXJhbSBlbGVtZW50IEVsZW1lbnQgd2hvc2UgdmlzaWJpbGl0eSB0byB0b2dnbGVcbiAqIEBwYXJhbSBlbmFibGUgV2hldGhlciB0aGUgZWxlbWVudCBzaG91bGQgYmUgdmlzaWJsZS5cbiAqIEBwYXJhbSBpbXBvcnRhbnRQcm9wZXJ0aWVzIFByb3BlcnRpZXMgdG8gYmUgc2V0IGFzIGAhaW1wb3J0YW50YC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZVZpc2liaWxpdHkoXG4gIGVsZW1lbnQ6IEhUTUxFbGVtZW50LFxuICBlbmFibGU6IGJvb2xlYW4sXG4gIGltcG9ydGFudFByb3BlcnRpZXM/OiBTZXQ8c3RyaW5nPixcbikge1xuICBleHRlbmRTdHlsZXMoXG4gICAgZWxlbWVudC5zdHlsZSxcbiAgICB7XG4gICAgICBwb3NpdGlvbjogZW5hYmxlID8gJycgOiAnZml4ZWQnLFxuICAgICAgdG9wOiBlbmFibGUgPyAnJyA6ICcwJyxcbiAgICAgIG9wYWNpdHk6IGVuYWJsZSA/ICcnIDogJzAnLFxuICAgICAgbGVmdDogZW5hYmxlID8gJycgOiAnLTk5OWVtJyxcbiAgICB9LFxuICAgIGltcG9ydGFudFByb3BlcnRpZXMsXG4gICk7XG59XG5cbi8qKlxuICogQ29tYmluZXMgYSB0cmFuc2Zvcm0gc3RyaW5nIHdpdGggYW4gb3B0aW9uYWwgb3RoZXIgdHJhbnNmb3JtXG4gKiB0aGF0IGV4aXRlZCBiZWZvcmUgdGhlIGJhc2UgdHJhbnNmb3JtIHdhcyBhcHBsaWVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZVRyYW5zZm9ybXModHJhbnNmb3JtOiBzdHJpbmcsIGluaXRpYWxUcmFuc2Zvcm0/OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gaW5pdGlhbFRyYW5zZm9ybSAmJiBpbml0aWFsVHJhbnNmb3JtICE9ICdub25lJ1xuICAgID8gdHJhbnNmb3JtICsgJyAnICsgaW5pdGlhbFRyYW5zZm9ybVxuICAgIDogdHJhbnNmb3JtO1xufVxuIl19
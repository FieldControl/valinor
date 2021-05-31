/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, EventEmitter, Input, Output, NgZone, InjectionToken, Inject, Optional, } from '@angular/core';
import { Clipboard } from './clipboard';
/** Injection token that can be used to provide the default options to `CdkCopyToClipboard`. */
export const CDK_COPY_TO_CLIPBOARD_CONFIG = new InjectionToken('CDK_COPY_TO_CLIPBOARD_CONFIG');
/**
 * @deprecated Use `CDK_COPY_TO_CLIPBOARD_CONFIG` instead.
 * @breaking-change 13.0.0
 */
export const CKD_COPY_TO_CLIPBOARD_CONFIG = CDK_COPY_TO_CLIPBOARD_CONFIG;
/**
 * Provides behavior for a button that when clicked copies content into user's
 * clipboard.
 */
export class CdkCopyToClipboard {
    constructor(_clipboard, _ngZone, config) {
        this._clipboard = _clipboard;
        this._ngZone = _ngZone;
        /** Content to be copied. */
        this.text = '';
        /**
         * How many times to attempt to copy the text. This may be necessary for longer text, because
         * the browser needs time to fill an intermediate textarea element and copy the content.
         */
        this.attempts = 1;
        /**
         * Emits when some text is copied to the clipboard. The
         * emitted value indicates whether copying was successful.
         */
        this.copied = new EventEmitter();
        /** Copies that are currently being attempted. */
        this._pending = new Set();
        if (config && config.attempts != null) {
            this.attempts = config.attempts;
        }
    }
    /** Copies the current text to the clipboard. */
    copy(attempts = this.attempts) {
        if (attempts > 1) {
            let remainingAttempts = attempts;
            const pending = this._clipboard.beginCopy(this.text);
            this._pending.add(pending);
            const attempt = () => {
                const successful = pending.copy();
                if (!successful && --remainingAttempts && !this._destroyed) {
                    // We use 1 for the timeout since it's more predictable when flushing in unit tests.
                    this._currentTimeout = this._ngZone.runOutsideAngular(() => setTimeout(attempt, 1));
                }
                else {
                    this._currentTimeout = null;
                    this._pending.delete(pending);
                    pending.destroy();
                    this.copied.emit(successful);
                }
            };
            attempt();
        }
        else {
            this.copied.emit(this._clipboard.copy(this.text));
        }
    }
    ngOnDestroy() {
        if (this._currentTimeout) {
            clearTimeout(this._currentTimeout);
        }
        this._pending.forEach(copy => copy.destroy());
        this._pending.clear();
        this._destroyed = true;
    }
}
CdkCopyToClipboard.decorators = [
    { type: Directive, args: [{
                selector: '[cdkCopyToClipboard]',
                host: {
                    '(click)': 'copy()',
                }
            },] }
];
CdkCopyToClipboard.ctorParameters = () => [
    { type: Clipboard },
    { type: NgZone },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [CKD_COPY_TO_CLIPBOARD_CONFIG,] }] }
];
CdkCopyToClipboard.propDecorators = {
    text: [{ type: Input, args: ['cdkCopyToClipboard',] }],
    attempts: [{ type: Input, args: ['cdkCopyToClipboardAttempts',] }],
    copied: [{ type: Output, args: ['cdkCopyToClipboardCopied',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29weS10by1jbGlwYm9hcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2NsaXBib2FyZC9jb3B5LXRvLWNsaXBib2FyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUNULFlBQVksRUFDWixLQUFLLEVBQ0wsTUFBTSxFQUNOLE1BQU0sRUFDTixjQUFjLEVBQ2QsTUFBTSxFQUNOLFFBQVEsR0FFVCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBU3RDLCtGQUErRjtBQUMvRixNQUFNLENBQUMsTUFBTSw0QkFBNEIsR0FDckMsSUFBSSxjQUFjLENBQTJCLDhCQUE4QixDQUFDLENBQUM7QUFFakY7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sNEJBQTRCLEdBQUcsNEJBQTRCLENBQUM7QUFFekU7OztHQUdHO0FBT0gsTUFBTSxPQUFPLGtCQUFrQjtJQXlCN0IsWUFDVSxVQUFxQixFQUNyQixPQUFlLEVBQzJCLE1BQWlDO1FBRjNFLGVBQVUsR0FBVixVQUFVLENBQVc7UUFDckIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQTFCekIsNEJBQTRCO1FBQ0MsU0FBSSxHQUFXLEVBQUUsQ0FBQztRQUUvQzs7O1dBR0c7UUFDa0MsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUUxRDs7O1dBR0c7UUFDMEMsV0FBTSxHQUFHLElBQUksWUFBWSxFQUFXLENBQUM7UUFFbEYsaURBQWlEO1FBQ3pDLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBZSxDQUFDO1FBYXhDLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO1lBQ3JDLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztTQUNqQztJQUNILENBQUM7SUFFRCxnREFBZ0Q7SUFDaEQsSUFBSSxDQUFDLFdBQW1CLElBQUksQ0FBQyxRQUFRO1FBQ25DLElBQUksUUFBUSxHQUFHLENBQUMsRUFBRTtZQUNoQixJQUFJLGlCQUFpQixHQUFHLFFBQVEsQ0FBQztZQUNqQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFM0IsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFO2dCQUNuQixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRSxpQkFBaUIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7b0JBQzFELG9GQUFvRjtvQkFDcEYsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDckY7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7b0JBQzVCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM5QixPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ2xCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUM5QjtZQUNILENBQUMsQ0FBQztZQUNGLE9BQU8sRUFBRSxDQUFDO1NBQ1g7YUFBTTtZQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ25EO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDeEIsWUFBWSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUNwQztRQUVELElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUN6QixDQUFDOzs7WUExRUYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxzQkFBc0I7Z0JBQ2hDLElBQUksRUFBRTtvQkFDSixTQUFTLEVBQUUsUUFBUTtpQkFDcEI7YUFDRjs7O1lBNUJPLFNBQVM7WUFOZixNQUFNOzRDQStESCxRQUFRLFlBQUksTUFBTSxTQUFDLDRCQUE0Qjs7O21CQTFCakQsS0FBSyxTQUFDLG9CQUFvQjt1QkFNMUIsS0FBSyxTQUFDLDRCQUE0QjtxQkFNbEMsTUFBTSxTQUFDLDBCQUEwQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5wdXQsXG4gIE91dHB1dCxcbiAgTmdab25lLFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5qZWN0LFxuICBPcHRpb25hbCxcbiAgT25EZXN0cm95LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2xpcGJvYXJkfSBmcm9tICcuL2NsaXBib2FyZCc7XG5pbXBvcnQge1BlbmRpbmdDb3B5fSBmcm9tICcuL3BlbmRpbmctY29weSc7XG5cbi8qKiBPYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byBjb25maWd1cmUgdGhlIGRlZmF1bHQgb3B0aW9ucyBmb3IgYENka0NvcHlUb0NsaXBib2FyZGAuICovXG5leHBvcnQgaW50ZXJmYWNlIENka0NvcHlUb0NsaXBib2FyZENvbmZpZyB7XG4gIC8qKiBEZWZhdWx0IG51bWJlciBvZiBhdHRlbXB0cyB0byBtYWtlIHdoZW4gY29weWluZyB0ZXh0IHRvIHRoZSBjbGlwYm9hcmQuICovXG4gIGF0dGVtcHRzPzogbnVtYmVyO1xufVxuXG4vKiogSW5qZWN0aW9uIHRva2VuIHRoYXQgY2FuIGJlIHVzZWQgdG8gcHJvdmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zIHRvIGBDZGtDb3B5VG9DbGlwYm9hcmRgLiAqL1xuZXhwb3J0IGNvbnN0IENES19DT1BZX1RPX0NMSVBCT0FSRF9DT05GSUcgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxDZGtDb3B5VG9DbGlwYm9hcmRDb25maWc+KCdDREtfQ09QWV9UT19DTElQQk9BUkRfQ09ORklHJyk7XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgVXNlIGBDREtfQ09QWV9UT19DTElQQk9BUkRfQ09ORklHYCBpbnN0ZWFkLlxuICogQGJyZWFraW5nLWNoYW5nZSAxMy4wLjBcbiAqL1xuZXhwb3J0IGNvbnN0IENLRF9DT1BZX1RPX0NMSVBCT0FSRF9DT05GSUcgPSBDREtfQ09QWV9UT19DTElQQk9BUkRfQ09ORklHO1xuXG4vKipcbiAqIFByb3ZpZGVzIGJlaGF2aW9yIGZvciBhIGJ1dHRvbiB0aGF0IHdoZW4gY2xpY2tlZCBjb3BpZXMgY29udGVudCBpbnRvIHVzZXInc1xuICogY2xpcGJvYXJkLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrQ29weVRvQ2xpcGJvYXJkXScsXG4gIGhvc3Q6IHtcbiAgICAnKGNsaWNrKSc6ICdjb3B5KCknLFxuICB9XG59KVxuZXhwb3J0IGNsYXNzIENka0NvcHlUb0NsaXBib2FyZCBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8qKiBDb250ZW50IHRvIGJlIGNvcGllZC4gKi9cbiAgQElucHV0KCdjZGtDb3B5VG9DbGlwYm9hcmQnKSB0ZXh0OiBzdHJpbmcgPSAnJztcblxuICAvKipcbiAgICogSG93IG1hbnkgdGltZXMgdG8gYXR0ZW1wdCB0byBjb3B5IHRoZSB0ZXh0LiBUaGlzIG1heSBiZSBuZWNlc3NhcnkgZm9yIGxvbmdlciB0ZXh0LCBiZWNhdXNlXG4gICAqIHRoZSBicm93c2VyIG5lZWRzIHRpbWUgdG8gZmlsbCBhbiBpbnRlcm1lZGlhdGUgdGV4dGFyZWEgZWxlbWVudCBhbmQgY29weSB0aGUgY29udGVudC5cbiAgICovXG4gIEBJbnB1dCgnY2RrQ29weVRvQ2xpcGJvYXJkQXR0ZW1wdHMnKSBhdHRlbXB0czogbnVtYmVyID0gMTtcblxuICAvKipcbiAgICogRW1pdHMgd2hlbiBzb21lIHRleHQgaXMgY29waWVkIHRvIHRoZSBjbGlwYm9hcmQuIFRoZVxuICAgKiBlbWl0dGVkIHZhbHVlIGluZGljYXRlcyB3aGV0aGVyIGNvcHlpbmcgd2FzIHN1Y2Nlc3NmdWwuXG4gICAqL1xuICBAT3V0cHV0KCdjZGtDb3B5VG9DbGlwYm9hcmRDb3BpZWQnKSByZWFkb25seSBjb3BpZWQgPSBuZXcgRXZlbnRFbWl0dGVyPGJvb2xlYW4+KCk7XG5cbiAgLyoqIENvcGllcyB0aGF0IGFyZSBjdXJyZW50bHkgYmVpbmcgYXR0ZW1wdGVkLiAqL1xuICBwcml2YXRlIF9wZW5kaW5nID0gbmV3IFNldDxQZW5kaW5nQ29weT4oKTtcblxuICAvKiogV2hldGhlciB0aGUgZGlyZWN0aXZlIGhhcyBiZWVuIGRlc3Ryb3llZC4gKi9cbiAgcHJpdmF0ZSBfZGVzdHJveWVkOiBib29sZWFuO1xuXG4gIC8qKiBUaW1lb3V0IGZvciB0aGUgY3VycmVudCBjb3B5IGF0dGVtcHQuICovXG4gIHByaXZhdGUgX2N1cnJlbnRUaW1lb3V0OiBhbnk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfY2xpcGJvYXJkOiBDbGlwYm9hcmQsXG4gICAgcHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChDS0RfQ09QWV9UT19DTElQQk9BUkRfQ09ORklHKSBjb25maWc/OiBDZGtDb3B5VG9DbGlwYm9hcmRDb25maWcpIHtcblxuICAgIGlmIChjb25maWcgJiYgY29uZmlnLmF0dGVtcHRzICE9IG51bGwpIHtcbiAgICAgIHRoaXMuYXR0ZW1wdHMgPSBjb25maWcuYXR0ZW1wdHM7XG4gICAgfVxuICB9XG5cbiAgLyoqIENvcGllcyB0aGUgY3VycmVudCB0ZXh0IHRvIHRoZSBjbGlwYm9hcmQuICovXG4gIGNvcHkoYXR0ZW1wdHM6IG51bWJlciA9IHRoaXMuYXR0ZW1wdHMpOiB2b2lkIHtcbiAgICBpZiAoYXR0ZW1wdHMgPiAxKSB7XG4gICAgICBsZXQgcmVtYWluaW5nQXR0ZW1wdHMgPSBhdHRlbXB0cztcbiAgICAgIGNvbnN0IHBlbmRpbmcgPSB0aGlzLl9jbGlwYm9hcmQuYmVnaW5Db3B5KHRoaXMudGV4dCk7XG4gICAgICB0aGlzLl9wZW5kaW5nLmFkZChwZW5kaW5nKTtcblxuICAgICAgY29uc3QgYXR0ZW1wdCA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3VjY2Vzc2Z1bCA9IHBlbmRpbmcuY29weSgpO1xuICAgICAgICBpZiAoIXN1Y2Nlc3NmdWwgJiYgLS1yZW1haW5pbmdBdHRlbXB0cyAmJiAhdGhpcy5fZGVzdHJveWVkKSB7XG4gICAgICAgICAgLy8gV2UgdXNlIDEgZm9yIHRoZSB0aW1lb3V0IHNpbmNlIGl0J3MgbW9yZSBwcmVkaWN0YWJsZSB3aGVuIGZsdXNoaW5nIGluIHVuaXQgdGVzdHMuXG4gICAgICAgICAgdGhpcy5fY3VycmVudFRpbWVvdXQgPSB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gc2V0VGltZW91dChhdHRlbXB0LCAxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fY3VycmVudFRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgIHRoaXMuX3BlbmRpbmcuZGVsZXRlKHBlbmRpbmcpO1xuICAgICAgICAgIHBlbmRpbmcuZGVzdHJveSgpO1xuICAgICAgICAgIHRoaXMuY29waWVkLmVtaXQoc3VjY2Vzc2Z1bCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBhdHRlbXB0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29waWVkLmVtaXQodGhpcy5fY2xpcGJvYXJkLmNvcHkodGhpcy50ZXh0KSk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuX2N1cnJlbnRUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fY3VycmVudFRpbWVvdXQpO1xuICAgIH1cblxuICAgIHRoaXMuX3BlbmRpbmcuZm9yRWFjaChjb3B5ID0+IGNvcHkuZGVzdHJveSgpKTtcbiAgICB0aGlzLl9wZW5kaW5nLmNsZWFyKCk7XG4gICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgfVxufVxuIl19
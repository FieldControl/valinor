/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A pending copy-to-clipboard operation.
 *
 * The implementation of copying text to the clipboard modifies the DOM and
 * forces a re-layout. This re-layout can take too long if the string is large,
 * causing the execCommand('copy') to happen too long after the user clicked.
 * This results in the browser refusing to copy. This object lets the
 * re-layout happen in a separate tick from copying by providing a copy function
 * that can be called later.
 *
 * Destroy must be called when no longer in use, regardless of whether `copy` is
 * called.
 */
export class PendingCopy {
    constructor(text, _document) {
        this._document = _document;
        const textarea = (this._textarea = this._document.createElement('textarea'));
        const styles = textarea.style;
        // Hide the element for display and accessibility. Set a fixed position so the page layout
        // isn't affected. We use `fixed` with `top: 0`, because focus is moved into the textarea
        // for a split second and if it's off-screen, some browsers will attempt to scroll it into view.
        styles.position = 'fixed';
        styles.top = styles.opacity = '0';
        styles.left = '-999em';
        textarea.setAttribute('aria-hidden', 'true');
        textarea.value = text;
        // Making the textarea `readonly` prevents the screen from jumping on iOS Safari (see #25169).
        textarea.readOnly = true;
        this._document.body.appendChild(textarea);
    }
    /** Finishes copying the text. */
    copy() {
        const textarea = this._textarea;
        let successful = false;
        try {
            // Older browsers could throw if copy is not supported.
            if (textarea) {
                const currentFocus = this._document.activeElement;
                textarea.select();
                textarea.setSelectionRange(0, textarea.value.length);
                successful = this._document.execCommand('copy');
                if (currentFocus) {
                    currentFocus.focus();
                }
            }
        }
        catch {
            // Discard error.
            // Initial setting of {@code successful} will represent failure here.
        }
        return successful;
    }
    /** Cleans up DOM changes used to perform the copy operation. */
    destroy() {
        const textarea = this._textarea;
        if (textarea) {
            textarea.remove();
            this._textarea = undefined;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVuZGluZy1jb3B5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9jbGlwYm9hcmQvcGVuZGluZy1jb3B5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVIOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILE1BQU0sT0FBTyxXQUFXO0lBR3RCLFlBQVksSUFBWSxFQUFtQixTQUFtQjtRQUFuQixjQUFTLEdBQVQsU0FBUyxDQUFVO1FBQzVELE1BQU0sUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzdFLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFFOUIsMEZBQTBGO1FBQzFGLHlGQUF5RjtRQUN6RixnR0FBZ0c7UUFDaEcsTUFBTSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDMUIsTUFBTSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztRQUNsQyxNQUFNLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztRQUN2QixRQUFRLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM3QyxRQUFRLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUN0Qiw4RkFBOEY7UUFDOUYsUUFBUSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCxpQ0FBaUM7SUFDakMsSUFBSTtRQUNGLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDaEMsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBRXZCLElBQUk7WUFDRix1REFBdUQ7WUFDdkQsSUFBSSxRQUFRLEVBQUU7Z0JBQ1osTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUF3QyxDQUFDO2dCQUU3RSxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2xCLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDckQsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVoRCxJQUFJLFlBQVksRUFBRTtvQkFDaEIsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO2lCQUN0QjthQUNGO1NBQ0Y7UUFBQyxNQUFNO1lBQ04saUJBQWlCO1lBQ2pCLHFFQUFxRTtTQUN0RTtRQUVELE9BQU8sVUFBVSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxnRUFBZ0U7SUFDaEUsT0FBTztRQUNMLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFaEMsSUFBSSxRQUFRLEVBQUU7WUFDWixRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7U0FDNUI7SUFDSCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBBIHBlbmRpbmcgY29weS10by1jbGlwYm9hcmQgb3BlcmF0aW9uLlxuICpcbiAqIFRoZSBpbXBsZW1lbnRhdGlvbiBvZiBjb3B5aW5nIHRleHQgdG8gdGhlIGNsaXBib2FyZCBtb2RpZmllcyB0aGUgRE9NIGFuZFxuICogZm9yY2VzIGEgcmUtbGF5b3V0LiBUaGlzIHJlLWxheW91dCBjYW4gdGFrZSB0b28gbG9uZyBpZiB0aGUgc3RyaW5nIGlzIGxhcmdlLFxuICogY2F1c2luZyB0aGUgZXhlY0NvbW1hbmQoJ2NvcHknKSB0byBoYXBwZW4gdG9vIGxvbmcgYWZ0ZXIgdGhlIHVzZXIgY2xpY2tlZC5cbiAqIFRoaXMgcmVzdWx0cyBpbiB0aGUgYnJvd3NlciByZWZ1c2luZyB0byBjb3B5LiBUaGlzIG9iamVjdCBsZXRzIHRoZVxuICogcmUtbGF5b3V0IGhhcHBlbiBpbiBhIHNlcGFyYXRlIHRpY2sgZnJvbSBjb3B5aW5nIGJ5IHByb3ZpZGluZyBhIGNvcHkgZnVuY3Rpb25cbiAqIHRoYXQgY2FuIGJlIGNhbGxlZCBsYXRlci5cbiAqXG4gKiBEZXN0cm95IG11c3QgYmUgY2FsbGVkIHdoZW4gbm8gbG9uZ2VyIGluIHVzZSwgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIGBjb3B5YCBpc1xuICogY2FsbGVkLlxuICovXG5leHBvcnQgY2xhc3MgUGVuZGluZ0NvcHkge1xuICBwcml2YXRlIF90ZXh0YXJlYTogSFRNTFRleHRBcmVhRWxlbWVudCB8IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3Rvcih0ZXh0OiBzdHJpbmcsIHByaXZhdGUgcmVhZG9ubHkgX2RvY3VtZW50OiBEb2N1bWVudCkge1xuICAgIGNvbnN0IHRleHRhcmVhID0gKHRoaXMuX3RleHRhcmVhID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKSk7XG4gICAgY29uc3Qgc3R5bGVzID0gdGV4dGFyZWEuc3R5bGU7XG5cbiAgICAvLyBIaWRlIHRoZSBlbGVtZW50IGZvciBkaXNwbGF5IGFuZCBhY2Nlc3NpYmlsaXR5LiBTZXQgYSBmaXhlZCBwb3NpdGlvbiBzbyB0aGUgcGFnZSBsYXlvdXRcbiAgICAvLyBpc24ndCBhZmZlY3RlZC4gV2UgdXNlIGBmaXhlZGAgd2l0aCBgdG9wOiAwYCwgYmVjYXVzZSBmb2N1cyBpcyBtb3ZlZCBpbnRvIHRoZSB0ZXh0YXJlYVxuICAgIC8vIGZvciBhIHNwbGl0IHNlY29uZCBhbmQgaWYgaXQncyBvZmYtc2NyZWVuLCBzb21lIGJyb3dzZXJzIHdpbGwgYXR0ZW1wdCB0byBzY3JvbGwgaXQgaW50byB2aWV3LlxuICAgIHN0eWxlcy5wb3NpdGlvbiA9ICdmaXhlZCc7XG4gICAgc3R5bGVzLnRvcCA9IHN0eWxlcy5vcGFjaXR5ID0gJzAnO1xuICAgIHN0eWxlcy5sZWZ0ID0gJy05OTllbSc7XG4gICAgdGV4dGFyZWEuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgdGV4dGFyZWEudmFsdWUgPSB0ZXh0O1xuICAgIC8vIE1ha2luZyB0aGUgdGV4dGFyZWEgYHJlYWRvbmx5YCBwcmV2ZW50cyB0aGUgc2NyZWVuIGZyb20ganVtcGluZyBvbiBpT1MgU2FmYXJpIChzZWUgIzI1MTY5KS5cbiAgICB0ZXh0YXJlYS5yZWFkT25seSA9IHRydWU7XG4gICAgdGhpcy5fZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZXh0YXJlYSk7XG4gIH1cblxuICAvKiogRmluaXNoZXMgY29weWluZyB0aGUgdGV4dC4gKi9cbiAgY29weSgpOiBib29sZWFuIHtcbiAgICBjb25zdCB0ZXh0YXJlYSA9IHRoaXMuX3RleHRhcmVhO1xuICAgIGxldCBzdWNjZXNzZnVsID0gZmFsc2U7XG5cbiAgICB0cnkge1xuICAgICAgLy8gT2xkZXIgYnJvd3NlcnMgY291bGQgdGhyb3cgaWYgY29weSBpcyBub3Qgc3VwcG9ydGVkLlxuICAgICAgaWYgKHRleHRhcmVhKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRGb2N1cyA9IHRoaXMuX2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgSFRNTE9yU1ZHRWxlbWVudCB8IG51bGw7XG5cbiAgICAgICAgdGV4dGFyZWEuc2VsZWN0KCk7XG4gICAgICAgIHRleHRhcmVhLnNldFNlbGVjdGlvblJhbmdlKDAsIHRleHRhcmVhLnZhbHVlLmxlbmd0aCk7XG4gICAgICAgIHN1Y2Nlc3NmdWwgPSB0aGlzLl9kb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpO1xuXG4gICAgICAgIGlmIChjdXJyZW50Rm9jdXMpIHtcbiAgICAgICAgICBjdXJyZW50Rm9jdXMuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gRGlzY2FyZCBlcnJvci5cbiAgICAgIC8vIEluaXRpYWwgc2V0dGluZyBvZiB7QGNvZGUgc3VjY2Vzc2Z1bH0gd2lsbCByZXByZXNlbnQgZmFpbHVyZSBoZXJlLlxuICAgIH1cblxuICAgIHJldHVybiBzdWNjZXNzZnVsO1xuICB9XG5cbiAgLyoqIENsZWFucyB1cCBET00gY2hhbmdlcyB1c2VkIHRvIHBlcmZvcm0gdGhlIGNvcHkgb3BlcmF0aW9uLiAqL1xuICBkZXN0cm95KCkge1xuICAgIGNvbnN0IHRleHRhcmVhID0gdGhpcy5fdGV4dGFyZWE7XG5cbiAgICBpZiAodGV4dGFyZWEpIHtcbiAgICAgIHRleHRhcmVhLnJlbW92ZSgpO1xuICAgICAgdGhpcy5fdGV4dGFyZWEgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG59XG4iXX0=
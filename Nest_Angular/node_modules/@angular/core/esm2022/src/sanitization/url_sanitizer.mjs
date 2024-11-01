/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { XSS_SECURITY_URL } from '../error_details_base_url';
/**
 * A pattern that recognizes URLs that are safe wrt. XSS in URL navigation
 * contexts.
 *
 * This regular expression matches a subset of URLs that will not cause script
 * execution if used in URL context within a HTML document. Specifically, this
 * regular expression matches if:
 * (1) Either a protocol that is not javascript:, and that has valid characters
 *     (alphanumeric or [+-.]).
 * (2) or no protocol.  A protocol must be followed by a colon. The below
 *     allows that by allowing colons only after one of the characters [/?#].
 *     A colon after a hash (#) must be in the fragment.
 *     Otherwise, a colon after a (?) must be in a query.
 *     Otherwise, a colon after a single solidus (/) must be in a path.
 *     Otherwise, a colon after a double solidus (//) must be in the authority
 *     (before port).
 *
 * The pattern disallows &, used in HTML entity declarations before
 * one of the characters in [/?#]. This disallows HTML entities used in the
 * protocol name, which should never happen, e.g. "h&#116;tp" for "http".
 * It also disallows HTML entities in the first path part of a relative path,
 * e.g. "foo&lt;bar/baz".  Our existing escaping functions should not produce
 * that. More importantly, it disallows masking of a colon,
 * e.g. "javascript&#58;...".
 *
 * This regular expression was taken from the Closure sanitization library.
 */
const SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:\/?#]*(?:[\/?#]|$))/i;
export function _sanitizeUrl(url) {
    url = String(url);
    if (url.match(SAFE_URL_PATTERN))
        return url;
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.warn(`WARNING: sanitizing unsafe URL value ${url} (see ${XSS_SECURITY_URL})`);
    }
    return 'unsafe:' + url;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsX3Nhbml0aXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3Nhbml0aXphdGlvbi91cmxfc2FuaXRpemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBRTNEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBCRztBQUNILE1BQU0sZ0JBQWdCLEdBQUcsMkRBQTJELENBQUM7QUFDckYsTUFBTSxVQUFVLFlBQVksQ0FBQyxHQUFXO0lBQ3RDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbEIsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDO1FBQUUsT0FBTyxHQUFHLENBQUM7SUFFNUMsSUFBSSxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxFQUFFLENBQUM7UUFDbEQsT0FBTyxDQUFDLElBQUksQ0FBQyx3Q0FBd0MsR0FBRyxTQUFTLGdCQUFnQixHQUFHLENBQUMsQ0FBQztJQUN4RixDQUFDO0lBRUQsT0FBTyxTQUFTLEdBQUcsR0FBRyxDQUFDO0FBQ3pCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7WFNTX1NFQ1VSSVRZX1VSTH0gZnJvbSAnLi4vZXJyb3JfZGV0YWlsc19iYXNlX3VybCc7XG5cbi8qKlxuICogQSBwYXR0ZXJuIHRoYXQgcmVjb2duaXplcyBVUkxzIHRoYXQgYXJlIHNhZmUgd3J0LiBYU1MgaW4gVVJMIG5hdmlnYXRpb25cbiAqIGNvbnRleHRzLlxuICpcbiAqIFRoaXMgcmVndWxhciBleHByZXNzaW9uIG1hdGNoZXMgYSBzdWJzZXQgb2YgVVJMcyB0aGF0IHdpbGwgbm90IGNhdXNlIHNjcmlwdFxuICogZXhlY3V0aW9uIGlmIHVzZWQgaW4gVVJMIGNvbnRleHQgd2l0aGluIGEgSFRNTCBkb2N1bWVudC4gU3BlY2lmaWNhbGx5LCB0aGlzXG4gKiByZWd1bGFyIGV4cHJlc3Npb24gbWF0Y2hlcyBpZjpcbiAqICgxKSBFaXRoZXIgYSBwcm90b2NvbCB0aGF0IGlzIG5vdCBqYXZhc2NyaXB0OiwgYW5kIHRoYXQgaGFzIHZhbGlkIGNoYXJhY3RlcnNcbiAqICAgICAoYWxwaGFudW1lcmljIG9yIFsrLS5dKS5cbiAqICgyKSBvciBubyBwcm90b2NvbC4gIEEgcHJvdG9jb2wgbXVzdCBiZSBmb2xsb3dlZCBieSBhIGNvbG9uLiBUaGUgYmVsb3dcbiAqICAgICBhbGxvd3MgdGhhdCBieSBhbGxvd2luZyBjb2xvbnMgb25seSBhZnRlciBvbmUgb2YgdGhlIGNoYXJhY3RlcnMgWy8/I10uXG4gKiAgICAgQSBjb2xvbiBhZnRlciBhIGhhc2ggKCMpIG11c3QgYmUgaW4gdGhlIGZyYWdtZW50LlxuICogICAgIE90aGVyd2lzZSwgYSBjb2xvbiBhZnRlciBhICg/KSBtdXN0IGJlIGluIGEgcXVlcnkuXG4gKiAgICAgT3RoZXJ3aXNlLCBhIGNvbG9uIGFmdGVyIGEgc2luZ2xlIHNvbGlkdXMgKC8pIG11c3QgYmUgaW4gYSBwYXRoLlxuICogICAgIE90aGVyd2lzZSwgYSBjb2xvbiBhZnRlciBhIGRvdWJsZSBzb2xpZHVzICgvLykgbXVzdCBiZSBpbiB0aGUgYXV0aG9yaXR5XG4gKiAgICAgKGJlZm9yZSBwb3J0KS5cbiAqXG4gKiBUaGUgcGF0dGVybiBkaXNhbGxvd3MgJiwgdXNlZCBpbiBIVE1MIGVudGl0eSBkZWNsYXJhdGlvbnMgYmVmb3JlXG4gKiBvbmUgb2YgdGhlIGNoYXJhY3RlcnMgaW4gWy8/I10uIFRoaXMgZGlzYWxsb3dzIEhUTUwgZW50aXRpZXMgdXNlZCBpbiB0aGVcbiAqIHByb3RvY29sIG5hbWUsIHdoaWNoIHNob3VsZCBuZXZlciBoYXBwZW4sIGUuZy4gXCJoJiMxMTY7dHBcIiBmb3IgXCJodHRwXCIuXG4gKiBJdCBhbHNvIGRpc2FsbG93cyBIVE1MIGVudGl0aWVzIGluIHRoZSBmaXJzdCBwYXRoIHBhcnQgb2YgYSByZWxhdGl2ZSBwYXRoLFxuICogZS5nLiBcImZvbyZsdDtiYXIvYmF6XCIuICBPdXIgZXhpc3RpbmcgZXNjYXBpbmcgZnVuY3Rpb25zIHNob3VsZCBub3QgcHJvZHVjZVxuICogdGhhdC4gTW9yZSBpbXBvcnRhbnRseSwgaXQgZGlzYWxsb3dzIG1hc2tpbmcgb2YgYSBjb2xvbixcbiAqIGUuZy4gXCJqYXZhc2NyaXB0JiM1ODsuLi5cIi5cbiAqXG4gKiBUaGlzIHJlZ3VsYXIgZXhwcmVzc2lvbiB3YXMgdGFrZW4gZnJvbSB0aGUgQ2xvc3VyZSBzYW5pdGl6YXRpb24gbGlicmFyeS5cbiAqL1xuY29uc3QgU0FGRV9VUkxfUEFUVEVSTiA9IC9eKD8hamF2YXNjcmlwdDopKD86W2EtejAtOSsuLV0rOnxbXiY6XFwvPyNdKig/OltcXC8/I118JCkpL2k7XG5leHBvcnQgZnVuY3Rpb24gX3Nhbml0aXplVXJsKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgdXJsID0gU3RyaW5nKHVybCk7XG4gIGlmICh1cmwubWF0Y2goU0FGRV9VUkxfUEFUVEVSTikpIHJldHVybiB1cmw7XG5cbiAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgIGNvbnNvbGUud2FybihgV0FSTklORzogc2FuaXRpemluZyB1bnNhZmUgVVJMIHZhbHVlICR7dXJsfSAoc2VlICR7WFNTX1NFQ1VSSVRZX1VSTH0pYCk7XG4gIH1cblxuICByZXR1cm4gJ3Vuc2FmZTonICsgdXJsO1xufVxuIl19
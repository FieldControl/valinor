/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * i18nAttributes ops will be generated for each i18n attribute. However, not all i18n attribues
 * will contain dynamic content, and so some of these i18nAttributes ops may be unnecessary.
 */
export function removeUnusedI18nAttributesOps(job) {
    for (const unit of job.units) {
        const ownersWithI18nExpressions = new Set();
        for (const op of unit.update) {
            switch (op.kind) {
                case ir.OpKind.I18nExpression:
                    ownersWithI18nExpressions.add(op.i18nOwner);
            }
        }
        for (const op of unit.create) {
            switch (op.kind) {
                case ir.OpKind.I18nAttributes:
                    if (ownersWithI18nExpressions.has(op.xref)) {
                        continue;
                    }
                    ir.OpList.remove(op);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlX3VudXNlZF9pMThuX2F0dHJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvcmVtb3ZlX3VudXNlZF9pMThuX2F0dHJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COzs7R0FHRztBQUNILE1BQU0sVUFBVSw2QkFBNkIsQ0FBQyxHQUFtQjtJQUMvRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixNQUFNLHlCQUF5QixHQUFHLElBQUksR0FBRyxFQUFhLENBQUM7UUFFdkQsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjO29CQUMzQix5QkFBeUIsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hELENBQUM7UUFDSCxDQUFDO1FBRUQsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjO29CQUMzQixJQUFJLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzt3QkFDM0MsU0FBUztvQkFDWCxDQUFDO29CQUNELEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFjLEVBQUUsQ0FBQyxDQUFDO1lBQ3RDLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBpMThuQXR0cmlidXRlcyBvcHMgd2lsbCBiZSBnZW5lcmF0ZWQgZm9yIGVhY2ggaTE4biBhdHRyaWJ1dGUuIEhvd2V2ZXIsIG5vdCBhbGwgaTE4biBhdHRyaWJ1ZXNcbiAqIHdpbGwgY29udGFpbiBkeW5hbWljIGNvbnRlbnQsIGFuZCBzbyBzb21lIG9mIHRoZXNlIGkxOG5BdHRyaWJ1dGVzIG9wcyBtYXkgYmUgdW5uZWNlc3NhcnkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVVbnVzZWRJMThuQXR0cmlidXRlc09wcyhqb2I6IENvbXBpbGF0aW9uSm9iKSB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBjb25zdCBvd25lcnNXaXRoSTE4bkV4cHJlc3Npb25zID0gbmV3IFNldDxpci5YcmVmSWQ+KCk7XG5cbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQudXBkYXRlKSB7XG4gICAgICBzd2l0Y2ggKG9wLmtpbmQpIHtcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuSTE4bkV4cHJlc3Npb246XG4gICAgICAgICAgb3duZXJzV2l0aEkxOG5FeHByZXNzaW9ucy5hZGQob3AuaTE4bk93bmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBzd2l0Y2ggKG9wLmtpbmQpIHtcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuSTE4bkF0dHJpYnV0ZXM6XG4gICAgICAgICAgaWYgKG93bmVyc1dpdGhJMThuRXhwcmVzc2lvbnMuaGFzKG9wLnhyZWYpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaXIuT3BMaXN0LnJlbW92ZTxpci5DcmVhdGVPcD4ob3ApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19
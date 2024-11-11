/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * Change namespaces between HTML, SVG and MathML, depending on the next element.
 */
export function emitNamespaceChanges(job) {
    for (const unit of job.units) {
        let activeNamespace = ir.Namespace.HTML;
        for (const op of unit.create) {
            if (op.kind !== ir.OpKind.ElementStart) {
                continue;
            }
            if (op.namespace !== activeNamespace) {
                ir.OpList.insertBefore(ir.createNamespaceOp(op.namespace), op);
                activeNamespace = op.namespace;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmFtZXNwYWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvbmFtZXNwYWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COztHQUVHO0FBQ0gsTUFBTSxVQUFVLG9CQUFvQixDQUFDLEdBQW1CO0lBQ3RELEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLElBQUksZUFBZSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1FBRXhDLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUN2QyxTQUFTO1lBQ1gsQ0FBQztZQUNELElBQUksRUFBRSxDQUFDLFNBQVMsS0FBSyxlQUFlLEVBQUUsQ0FBQztnQkFDckMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQWMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDNUUsZUFBZSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUM7WUFDakMsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHR5cGUge0NvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogQ2hhbmdlIG5hbWVzcGFjZXMgYmV0d2VlbiBIVE1MLCBTVkcgYW5kIE1hdGhNTCwgZGVwZW5kaW5nIG9uIHRoZSBuZXh0IGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbWl0TmFtZXNwYWNlQ2hhbmdlcyhqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBsZXQgYWN0aXZlTmFtZXNwYWNlID0gaXIuTmFtZXNwYWNlLkhUTUw7XG5cbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBpZiAob3Aua2luZCAhPT0gaXIuT3BLaW5kLkVsZW1lbnRTdGFydCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmIChvcC5uYW1lc3BhY2UgIT09IGFjdGl2ZU5hbWVzcGFjZSkge1xuICAgICAgICBpci5PcExpc3QuaW5zZXJ0QmVmb3JlPGlyLkNyZWF0ZU9wPihpci5jcmVhdGVOYW1lc3BhY2VPcChvcC5uYW1lc3BhY2UpLCBvcCk7XG4gICAgICAgIGFjdGl2ZU5hbWVzcGFjZSA9IG9wLm5hbWVzcGFjZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==
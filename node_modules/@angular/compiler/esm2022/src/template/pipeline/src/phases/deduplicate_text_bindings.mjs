/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * Deduplicate text bindings, e.g. <div class="cls1" class="cls2">
 */
export function deduplicateTextBindings(job) {
    const seen = new Map();
    for (const unit of job.units) {
        for (const op of unit.update.reversed()) {
            if (op.kind === ir.OpKind.Binding && op.isTextAttribute) {
                const seenForElement = seen.get(op.target) || new Set();
                if (seenForElement.has(op.name)) {
                    if (job.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder) {
                        // For most duplicated attributes, TemplateDefinitionBuilder lists all of the values in
                        // the consts array. However, for style and class attributes it only keeps the last one.
                        // We replicate that behavior here since it has actual consequences for apps with
                        // duplicate class or style attrs.
                        if (op.name === 'style' || op.name === 'class') {
                            ir.OpList.remove(op);
                        }
                    }
                    else {
                        // TODO: Determine the correct behavior. It would probably make sense to merge multiple
                        // style and class attributes. Alternatively we could just throw an error, as HTML
                        // doesn't permit duplicate attributes.
                    }
                }
                seenForElement.add(op.name);
                seen.set(op.target, seenForElement);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVkdXBsaWNhdGVfdGV4dF9iaW5kaW5ncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL2RlZHVwbGljYXRlX3RleHRfYmluZGluZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0I7O0dBRUc7QUFDSCxNQUFNLFVBQVUsdUJBQXVCLENBQUMsR0FBbUI7SUFDekQsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUM7SUFDL0MsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7WUFDeEMsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDeEQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDeEQsSUFBSSxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUNoQyxJQUFJLEdBQUcsQ0FBQyxhQUFhLEtBQUssRUFBRSxDQUFDLGlCQUFpQixDQUFDLHlCQUF5QixFQUFFLENBQUM7d0JBQ3pFLHVGQUF1Rjt3QkFDdkYsd0ZBQXdGO3dCQUN4RixpRkFBaUY7d0JBQ2pGLGtDQUFrQzt3QkFDbEMsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLE9BQU8sSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRSxDQUFDOzRCQUMvQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBYyxFQUFFLENBQUMsQ0FBQzt3QkFDcEMsQ0FBQztvQkFDSCxDQUFDO3lCQUFNLENBQUM7d0JBQ04sdUZBQXVGO3dCQUN2RixrRkFBa0Y7d0JBQ2xGLHVDQUF1QztvQkFDekMsQ0FBQztnQkFDSCxDQUFDO2dCQUNELGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDdEMsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHR5cGUge0NvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogRGVkdXBsaWNhdGUgdGV4dCBiaW5kaW5ncywgZS5nLiA8ZGl2IGNsYXNzPVwiY2xzMVwiIGNsYXNzPVwiY2xzMlwiPlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVkdXBsaWNhdGVUZXh0QmluZGluZ3Moam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBjb25zdCBzZWVuID0gbmV3IE1hcDxpci5YcmVmSWQsIFNldDxzdHJpbmc+PigpO1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LnVwZGF0ZS5yZXZlcnNlZCgpKSB7XG4gICAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLkJpbmRpbmcgJiYgb3AuaXNUZXh0QXR0cmlidXRlKSB7XG4gICAgICAgIGNvbnN0IHNlZW5Gb3JFbGVtZW50ID0gc2Vlbi5nZXQob3AudGFyZ2V0KSB8fCBuZXcgU2V0KCk7XG4gICAgICAgIGlmIChzZWVuRm9yRWxlbWVudC5oYXMob3AubmFtZSkpIHtcbiAgICAgICAgICBpZiAoam9iLmNvbXBhdGliaWxpdHkgPT09IGlyLkNvbXBhdGliaWxpdHlNb2RlLlRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIpIHtcbiAgICAgICAgICAgIC8vIEZvciBtb3N0IGR1cGxpY2F0ZWQgYXR0cmlidXRlcywgVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlciBsaXN0cyBhbGwgb2YgdGhlIHZhbHVlcyBpblxuICAgICAgICAgICAgLy8gdGhlIGNvbnN0cyBhcnJheS4gSG93ZXZlciwgZm9yIHN0eWxlIGFuZCBjbGFzcyBhdHRyaWJ1dGVzIGl0IG9ubHkga2VlcHMgdGhlIGxhc3Qgb25lLlxuICAgICAgICAgICAgLy8gV2UgcmVwbGljYXRlIHRoYXQgYmVoYXZpb3IgaGVyZSBzaW5jZSBpdCBoYXMgYWN0dWFsIGNvbnNlcXVlbmNlcyBmb3IgYXBwcyB3aXRoXG4gICAgICAgICAgICAvLyBkdXBsaWNhdGUgY2xhc3Mgb3Igc3R5bGUgYXR0cnMuXG4gICAgICAgICAgICBpZiAob3AubmFtZSA9PT0gJ3N0eWxlJyB8fCBvcC5uYW1lID09PSAnY2xhc3MnKSB7XG4gICAgICAgICAgICAgIGlyLk9wTGlzdC5yZW1vdmU8aXIuVXBkYXRlT3A+KG9wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVE9ETzogRGV0ZXJtaW5lIHRoZSBjb3JyZWN0IGJlaGF2aW9yLiBJdCB3b3VsZCBwcm9iYWJseSBtYWtlIHNlbnNlIHRvIG1lcmdlIG11bHRpcGxlXG4gICAgICAgICAgICAvLyBzdHlsZSBhbmQgY2xhc3MgYXR0cmlidXRlcy4gQWx0ZXJuYXRpdmVseSB3ZSBjb3VsZCBqdXN0IHRocm93IGFuIGVycm9yLCBhcyBIVE1MXG4gICAgICAgICAgICAvLyBkb2Vzbid0IHBlcm1pdCBkdXBsaWNhdGUgYXR0cmlidXRlcy5cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2VlbkZvckVsZW1lbnQuYWRkKG9wLm5hbWUpO1xuICAgICAgICBzZWVuLnNldChvcC50YXJnZXQsIHNlZW5Gb3JFbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==
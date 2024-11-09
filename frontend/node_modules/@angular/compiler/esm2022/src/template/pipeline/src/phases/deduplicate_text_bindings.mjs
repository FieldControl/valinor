/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVkdXBsaWNhdGVfdGV4dF9iaW5kaW5ncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL2RlZHVwbGljYXRlX3RleHRfYmluZGluZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0I7O0dBRUc7QUFDSCxNQUFNLFVBQVUsdUJBQXVCLENBQUMsR0FBbUI7SUFDekQsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUM7SUFDL0MsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7WUFDeEMsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDeEQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDeEQsSUFBSSxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUNoQyxJQUFJLEdBQUcsQ0FBQyxhQUFhLEtBQUssRUFBRSxDQUFDLGlCQUFpQixDQUFDLHlCQUF5QixFQUFFLENBQUM7d0JBQ3pFLHVGQUF1Rjt3QkFDdkYsd0ZBQXdGO3dCQUN4RixpRkFBaUY7d0JBQ2pGLGtDQUFrQzt3QkFDbEMsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLE9BQU8sSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRSxDQUFDOzRCQUMvQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBYyxFQUFFLENBQUMsQ0FBQzt3QkFDcEMsQ0FBQztvQkFDSCxDQUFDO3lCQUFNLENBQUM7d0JBQ04sdUZBQXVGO3dCQUN2RixrRkFBa0Y7d0JBQ2xGLHVDQUF1QztvQkFDekMsQ0FBQztnQkFDSCxDQUFDO2dCQUNELGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDdEMsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQgdHlwZSB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBEZWR1cGxpY2F0ZSB0ZXh0IGJpbmRpbmdzLCBlLmcuIDxkaXYgY2xhc3M9XCJjbHMxXCIgY2xhc3M9XCJjbHMyXCI+XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWR1cGxpY2F0ZVRleHRCaW5kaW5ncyhqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGNvbnN0IHNlZW4gPSBuZXcgTWFwPGlyLlhyZWZJZCwgU2V0PHN0cmluZz4+KCk7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQudXBkYXRlLnJldmVyc2VkKCkpIHtcbiAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuQmluZGluZyAmJiBvcC5pc1RleHRBdHRyaWJ1dGUpIHtcbiAgICAgICAgY29uc3Qgc2VlbkZvckVsZW1lbnQgPSBzZWVuLmdldChvcC50YXJnZXQpIHx8IG5ldyBTZXQoKTtcbiAgICAgICAgaWYgKHNlZW5Gb3JFbGVtZW50LmhhcyhvcC5uYW1lKSkge1xuICAgICAgICAgIGlmIChqb2IuY29tcGF0aWJpbGl0eSA9PT0gaXIuQ29tcGF0aWJpbGl0eU1vZGUuVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlcikge1xuICAgICAgICAgICAgLy8gRm9yIG1vc3QgZHVwbGljYXRlZCBhdHRyaWJ1dGVzLCBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyIGxpc3RzIGFsbCBvZiB0aGUgdmFsdWVzIGluXG4gICAgICAgICAgICAvLyB0aGUgY29uc3RzIGFycmF5LiBIb3dldmVyLCBmb3Igc3R5bGUgYW5kIGNsYXNzIGF0dHJpYnV0ZXMgaXQgb25seSBrZWVwcyB0aGUgbGFzdCBvbmUuXG4gICAgICAgICAgICAvLyBXZSByZXBsaWNhdGUgdGhhdCBiZWhhdmlvciBoZXJlIHNpbmNlIGl0IGhhcyBhY3R1YWwgY29uc2VxdWVuY2VzIGZvciBhcHBzIHdpdGhcbiAgICAgICAgICAgIC8vIGR1cGxpY2F0ZSBjbGFzcyBvciBzdHlsZSBhdHRycy5cbiAgICAgICAgICAgIGlmIChvcC5uYW1lID09PSAnc3R5bGUnIHx8IG9wLm5hbWUgPT09ICdjbGFzcycpIHtcbiAgICAgICAgICAgICAgaXIuT3BMaXN0LnJlbW92ZTxpci5VcGRhdGVPcD4ob3ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBEZXRlcm1pbmUgdGhlIGNvcnJlY3QgYmVoYXZpb3IuIEl0IHdvdWxkIHByb2JhYmx5IG1ha2Ugc2Vuc2UgdG8gbWVyZ2UgbXVsdGlwbGVcbiAgICAgICAgICAgIC8vIHN0eWxlIGFuZCBjbGFzcyBhdHRyaWJ1dGVzLiBBbHRlcm5hdGl2ZWx5IHdlIGNvdWxkIGp1c3QgdGhyb3cgYW4gZXJyb3IsIGFzIEhUTUxcbiAgICAgICAgICAgIC8vIGRvZXNuJ3QgcGVybWl0IGR1cGxpY2F0ZSBhdHRyaWJ1dGVzLlxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzZWVuRm9yRWxlbWVudC5hZGQob3AubmFtZSk7XG4gICAgICAgIHNlZW4uc2V0KG9wLnRhcmdldCwgc2VlbkZvckVsZW1lbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19
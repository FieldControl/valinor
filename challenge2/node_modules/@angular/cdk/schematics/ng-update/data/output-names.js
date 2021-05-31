"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputNames = void 0;
const target_version_1 = require("../../update-tool/target-version");
exports.outputNames = {
    [target_version_1.TargetVersion.V10]: [
        {
            pr: 'https://github.com/angular/components/pull/19362',
            changes: [{
                    replace: 'copied',
                    replaceWith: 'cdkCopyToClipboardCopied',
                    limitedTo: {
                        attributes: ['cdkCopyToClipboard']
                    }
                }]
        }
    ],
    [target_version_1.TargetVersion.V6]: [],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0LW5hbWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL25nLXVwZGF0ZS9kYXRhL291dHB1dC1uYW1lcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxxRUFBK0Q7QUFpQmxELFFBQUEsV0FBVyxHQUEwQztJQUNoRSxDQUFDLDhCQUFhLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDbkI7WUFDRSxFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRSxDQUFDO29CQUNSLE9BQU8sRUFBRSxRQUFRO29CQUNqQixXQUFXLEVBQUUsMEJBQTBCO29CQUN2QyxTQUFTLEVBQUU7d0JBQ1QsVUFBVSxFQUFFLENBQUMsb0JBQW9CLENBQUM7cUJBQ25DO2lCQUNGLENBQUM7U0FDSDtLQUNGO0lBQ0QsQ0FBQyw4QkFBYSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Q0FDdkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1RhcmdldFZlcnNpb259IGZyb20gJy4uLy4uL3VwZGF0ZS10b29sL3RhcmdldC12ZXJzaW9uJztcbmltcG9ydCB7VmVyc2lvbkNoYW5nZXN9IGZyb20gJy4uLy4uL3VwZGF0ZS10b29sL3ZlcnNpb24tY2hhbmdlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3V0cHV0TmFtZVVwZ3JhZGVEYXRhIHtcbiAgLyoqIFRoZSBAT3V0cHV0KCkgbmFtZSB0byByZXBsYWNlLiAqL1xuICByZXBsYWNlOiBzdHJpbmc7XG4gIC8qKiBUaGUgbmV3IG5hbWUgZm9yIHRoZSBAT3V0cHV0KCkuICovXG4gIHJlcGxhY2VXaXRoOiBzdHJpbmc7XG4gIC8qKiBDb250cm9scyB3aGljaCBlbGVtZW50cyBhbmQgYXR0cmlidXRlcyBpbiB3aGljaCB0aGlzIHJlcGxhY2VtZW50IGlzIG1hZGUuICovXG4gIGxpbWl0ZWRUbzoge1xuICAgIC8qKiBMaW1pdCB0byBlbGVtZW50cyB3aXRoIGFueSBvZiB0aGVzZSBlbGVtZW50IHRhZ3MuICovXG4gICAgZWxlbWVudHM/OiBzdHJpbmdbXSxcbiAgICAvKiogTGltaXQgdG8gZWxlbWVudHMgd2l0aCBhbnkgb2YgdGhlc2UgYXR0cmlidXRlcy4gKi9cbiAgICBhdHRyaWJ1dGVzPzogc3RyaW5nW10sXG4gIH07XG59XG5cbmV4cG9ydCBjb25zdCBvdXRwdXROYW1lczogVmVyc2lvbkNoYW5nZXM8T3V0cHV0TmFtZVVwZ3JhZGVEYXRhPiA9IHtcbiAgW1RhcmdldFZlcnNpb24uVjEwXTogW1xuICAgIHtcbiAgICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzE5MzYyJyxcbiAgICAgIGNoYW5nZXM6IFt7XG4gICAgICAgIHJlcGxhY2U6ICdjb3BpZWQnLFxuICAgICAgICByZXBsYWNlV2l0aDogJ2Nka0NvcHlUb0NsaXBib2FyZENvcGllZCcsXG4gICAgICAgIGxpbWl0ZWRUbzoge1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IFsnY2RrQ29weVRvQ2xpcGJvYXJkJ11cbiAgICAgICAgfVxuICAgICAgfV1cbiAgICB9XG4gIF0sXG4gIFtUYXJnZXRWZXJzaW9uLlY2XTogW10sXG59O1xuIl19
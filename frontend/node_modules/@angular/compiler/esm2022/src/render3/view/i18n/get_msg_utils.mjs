import { mapLiteral } from '../../../output/map_util';
import * as o from '../../../output/output_ast';
import { serializeIcuNode } from './icu_serializer';
import { i18nMetaToJSDoc } from './meta';
import { formatI18nPlaceholderName, formatI18nPlaceholderNamesInMap } from './util';
/** Closure uses `goog.getMsg(message)` to lookup translations */
const GOOG_GET_MSG = 'goog.getMsg';
/**
 * Generates a `goog.getMsg()` statement and reassignment. The template:
 *
 * ```html
 * <div i18n>Sent from {{ sender }} to <span class="receiver">{{ receiver }}</span></div>
 * ```
 *
 * Generates:
 *
 * ```typescript
 * const MSG_FOO = goog.getMsg(
 *   // Message template.
 *   'Sent from {$interpolation} to {$startTagSpan}{$interpolation_1}{$closeTagSpan}.',
 *   // Placeholder values, set to magic strings which get replaced by the Angular runtime.
 *   {
 *     'interpolation': '\uFFFD0\uFFFD',
 *     'startTagSpan': '\uFFFD1\uFFFD',
 *     'interpolation_1': '\uFFFD2\uFFFD',
 *     'closeTagSpan': '\uFFFD3\uFFFD',
 *   },
 *   // Options bag.
 *   {
 *     // Maps each placeholder to the original Angular source code which generates it's value.
 *     original_code: {
 *       'interpolation': '{{ sender }}',
 *       'startTagSpan': '<span class="receiver">',
 *       'interpolation_1': '{{ receiver }}',
 *       'closeTagSpan': '</span>',
 *     },
 *   },
 * );
 * const I18N_0 = MSG_FOO;
 * ```
 */
export function createGoogleGetMsgStatements(variable, message, closureVar, placeholderValues) {
    const messageString = serializeI18nMessageForGetMsg(message);
    const args = [o.literal(messageString)];
    if (Object.keys(placeholderValues).length) {
        // Message template parameters containing the magic strings replaced by the Angular runtime with
        // real data, e.g. `{'interpolation': '\uFFFD0\uFFFD'}`.
        args.push(mapLiteral(formatI18nPlaceholderNamesInMap(placeholderValues, true /* useCamelCase */), true /* quoted */));
        // Message options object, which contains original source code for placeholders (as they are
        // present in a template, e.g.
        // `{original_code: {'interpolation': '{{ name }}', 'startTagSpan': '<span>'}}`.
        args.push(mapLiteral({
            original_code: o.literalMap(Object.keys(placeholderValues)
                .map((param) => ({
                key: formatI18nPlaceholderName(param),
                quoted: true,
                value: message.placeholders[param] ?
                    // Get source span for typical placeholder if it exists.
                    o.literal(message.placeholders[param].sourceSpan.toString()) :
                    // Otherwise must be an ICU expression, get it's source span.
                    o.literal(message.placeholderToMessage[param]
                        .nodes.map((node) => node.sourceSpan.toString())
                        .join('')),
            }))),
        }));
    }
    // /**
    //  * @desc description of message
    //  * @meaning meaning of message
    //  */
    // const MSG_... = goog.getMsg(..);
    // I18N_X = MSG_...;
    const googGetMsgStmt = closureVar.set(o.variable(GOOG_GET_MSG).callFn(args)).toConstDecl();
    googGetMsgStmt.addLeadingComment(i18nMetaToJSDoc(message));
    const i18nAssignmentStmt = new o.ExpressionStatement(variable.set(closureVar));
    return [googGetMsgStmt, i18nAssignmentStmt];
}
/**
 * This visitor walks over i18n tree and generates its string representation, including ICUs and
 * placeholders in `{$placeholder}` (for plain messages) or `{PLACEHOLDER}` (inside ICUs) format.
 */
class GetMsgSerializerVisitor {
    formatPh(value) {
        return `{$${formatI18nPlaceholderName(value)}}`;
    }
    visitText(text) {
        return text.value;
    }
    visitContainer(container) {
        return container.children.map(child => child.visit(this)).join('');
    }
    visitIcu(icu) {
        return serializeIcuNode(icu);
    }
    visitTagPlaceholder(ph) {
        return ph.isVoid ?
            this.formatPh(ph.startName) :
            `${this.formatPh(ph.startName)}${ph.children.map(child => child.visit(this)).join('')}${this.formatPh(ph.closeName)}`;
    }
    visitPlaceholder(ph) {
        return this.formatPh(ph.name);
    }
    visitBlockPlaceholder(ph) {
        return `${this.formatPh(ph.startName)}${ph.children.map(child => child.visit(this)).join('')}${this.formatPh(ph.closeName)}`;
    }
    visitIcuPlaceholder(ph, context) {
        return this.formatPh(ph.name);
    }
}
const serializerVisitor = new GetMsgSerializerVisitor();
export function serializeI18nMessageForGetMsg(message) {
    return message.nodes.map(node => node.visit(serializerVisitor, null)).join('');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0X21zZ191dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3ZpZXcvaTE4bi9nZXRfbXNnX3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNwRCxPQUFPLEtBQUssQ0FBQyxNQUFNLDRCQUE0QixDQUFDO0FBRWhELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2xELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDdkMsT0FBTyxFQUFDLHlCQUF5QixFQUFFLCtCQUErQixFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRWxGLGlFQUFpRTtBQUNqRSxNQUFNLFlBQVksR0FBRyxhQUFhLENBQUM7QUFFbkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlDRztBQUNILE1BQU0sVUFBVSw0QkFBNEIsQ0FDeEMsUUFBdUIsRUFBRSxPQUFxQixFQUFFLFVBQXlCLEVBQ3pFLGlCQUFpRDtJQUNuRCxNQUFNLGFBQWEsR0FBRyw2QkFBNkIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM3RCxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFpQixDQUFDLENBQUM7SUFDeEQsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDMUMsZ0dBQWdHO1FBQ2hHLHdEQUF3RDtRQUN4RCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FDaEIsK0JBQStCLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQzNFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBRXhCLDRGQUE0RjtRQUM1Riw4QkFB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QUNuQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxxQkFBcUIsQ0FBQyxFQUF5QjtRQUM3QyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUN4RixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxFQUF1QixFQUFFLE9BQWE7UUFDeEQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxDQUFDO0NBQ0Y7QUFFRCxNQUFNLGlCQUFpQixHQUFHLElBQUksdUJBQXVCLEVBQUUsQ0FBQztBQUV4RCxNQUFNLFVBQVUsNkJBQTZCLENBQUMsT0FBcUI7SUFDakUsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDakYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgaTE4biBmcm9tICcuLi8uLi8uLi9pMThuL2kxOG5fYXN0JztcbmltcG9ydCB7bWFwTGl0ZXJhbH0gZnJvbSAnLi4vLi4vLi4vb3V0cHV0L21hcF91dGlsJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuXG5pbXBvcnQge3NlcmlhbGl6ZUljdU5vZGV9IGZyb20gJy4vaWN1X3NlcmlhbGl6ZXInO1xuaW1wb3J0IHtpMThuTWV0YVRvSlNEb2N9IGZyb20gJy4vbWV0YSc7XG5pbXBvcnQge2Zvcm1hdEkxOG5QbGFjZWhvbGRlck5hbWUsIGZvcm1hdEkxOG5QbGFjZWhvbGRlck5hbWVzSW5NYXB9IGZyb20gJy4vdXRpbCc7XG5cbi8qKiBDbG9zdXJlIHVzZXMgYGdvb2cuZ2V0TXNnKG1lc3NhZ2UpYCB0byBsb29rdXAgdHJhbnNsYXRpb25zICovXG5jb25zdCBHT09HX0dFVF9NU0cgPSAnZ29vZy5nZXRNc2cnO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGBnb29nLmdldE1zZygpYCBzdGF0ZW1lbnQgYW5kIHJlYXNzaWdubWVudC4gVGhlIHRlbXBsYXRlOlxuICpcbiAqIGBgYGh0bWxcbiAqIDxkaXYgaTE4bj5TZW50IGZyb20ge3sgc2VuZGVyIH19IHRvIDxzcGFuIGNsYXNzPVwicmVjZWl2ZXJcIj57eyByZWNlaXZlciB9fTwvc3Bhbj48L2Rpdj5cbiAqIGBgYFxuICpcbiAqIEdlbmVyYXRlczpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCBNU0dfRk9PID0gZ29vZy5nZXRNc2coXG4gKiAgIC8vIE1lc3NhZ2UgdGVtcGxhdGUuXG4gKiAgICdTZW50IGZyb20geyRpbnRlcnBvbGF0aW9ufSB0byB7JHN0YXJ0VGFnU3Bhbn17JGludGVycG9sYXRpb25fMX17JGNsb3NlVGFnU3Bhbn0uJyxcbiAqICAgLy8gUGxhY2Vob2xkZXIgdmFsdWVzLCBzZXQgdG8gbWFnaWMgc3RyaW5ncyB3aGljaCBnZXQgcmVwbGFjZWQgYnkgdGhlIEFuZ3VsYXIgcnVudGltZS5cbiAqICAge1xuICogICAgICdpbnRlcnBvbGF0aW9uJzogJ1xcdUZGRkQwXFx1RkZGRCcsXG4gKiAgICAgJ3N0YXJ0VGFnU3Bhbic6ICdcXHVGRkZEMVxcdUZGRkQnLFxuICogICAgICdpbnRlcnBvbGF0aW9uXzEnOiAnXFx1RkZGRDJcXHVGRkZEJyxcbiAqICAgICAnY2xvc2VUYWdTcGFuJzogJ1xcdUZGRkQzXFx1RkZGRCcsXG4gKiAgIH0sXG4gKiAgIC8vIE9wdGlvbnMgYmFnLlxuICogICB7XG4gKiAgICAgLy8gTWFwcyBlYWNoIHBsYWNlaG9sZGVyIHRvIHRoZSBvcmlnaW5hbCBBbmd1bGFyIHNvdXJjZSBjb2RlIHdoaWNoIGdlbmVyYXRlcyBpdCdzIHZhbHVlLlxuICogICAgIG9yaWdpbmFsX2NvZGU6IHtcbiAqICAgICAgICdpbnRlcnBvbGF0aW9uJzogJ3t7IHNlbmRlciB9fScsXG4gKiAgICAgICAnc3RhcnRUYWdTcGFuJzogJzxzcGFuIGNsYXNzPVwicmVjZWl2ZXJcIj4nLFxuICogICAgICAgJ2ludGVycG9sYXRpb25fMSc6ICd7eyByZWNlaXZlciB9fScsXG4gKiAgICAgICAnY2xvc2VUYWdTcGFuJzogJzwvc3Bhbj4nLFxuICogICAgIH0sXG4gKiAgIH0sXG4gKiApO1xuICogY29uc3QgSTE4Tl8wID0gTVNHX0ZPTztcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlR29vZ2xlR2V0TXNnU3RhdGVtZW50cyhcbiAgICB2YXJpYWJsZTogby5SZWFkVmFyRXhwciwgbWVzc2FnZTogaTE4bi5NZXNzYWdlLCBjbG9zdXJlVmFyOiBvLlJlYWRWYXJFeHByLFxuICAgIHBsYWNlaG9sZGVyVmFsdWVzOiB7W25hbWU6IHN0cmluZ106IG8uRXhwcmVzc2lvbn0pOiBvLlN0YXRlbWVudFtdIHtcbiAgY29uc3QgbWVzc2FnZVN0cmluZyA9IHNlcmlhbGl6ZUkxOG5NZXNzYWdlRm9yR2V0TXNnKG1lc3NhZ2UpO1xuICBjb25zdCBhcmdzID0gW28ubGl0ZXJhbChtZXNzYWdlU3RyaW5nKSBhcyBvLkV4cHJlc3Npb25dO1xuICBpZiAoT2JqZWN0LmtleXMocGxhY2Vob2xkZXJWYWx1ZXMpLmxlbmd0aCkge1xuICAgIC8vIE1lc3NhZ2UgdGVtcGxhdGUgcGFyYW1ldGVycyBjb250YWluaW5nIHRoZSBtYWdpYyBzdHJpbmdzIHJlcGxhY2VkIGJ5IHRoZSBBbmd1bGFyIHJ1bnRpbWUgd2l0aFxuICAgIC8vIHJlYWwgZGF0YSwgZS5nLiBgeydpbnRlcnBvbGF0aW9uJzogJ1xcdUZGRkQwXFx1RkZGRCd9YC5cbiAgICBhcmdzLnB1c2gobWFwTGl0ZXJhbChcbiAgICAgICAgZm9ybWF0STE4blBsYWNlaG9sZGVyTmFtZXNJbk1hcChwbGFjZWhvbGRlclZhbHVlcywgdHJ1ZSAvKiB1c2VDYW1lbENhc2UgKi8pLFxuICAgICAgICB0cnVlIC8qIHF1b3RlZCAqLykpO1xuXG4gICAgLy8gTWVzc2FnZSBvcHRpb25zIG9iamVjdCwgd2hpY2ggY29udGFpbnMgb3JpZ2luYWwgc291cmNlIGNvZGUgZm9yIHBsYWNlaG9sZGVycyAoYXMgdGhleSBhcmVcbiAgICAvLyBwcmVzZW50IGluIGEgdGVtcGxhdGUsIGUuZy5cbiAgICAvLyBge29yaWdpbmFsX2NvZGU6IHsnaW50ZXJwb2xhdGlvbic6ICd7eyBuYW1lIH19JywgJ3N0YXJ0VGFnU3Bhbic6ICc8c3Bhbj4nfX1gLlxuICAgIGFyZ3MucHVzaChtYXBMaXRlcmFsKHtcbiAgICAgIG9yaWdpbmFsX2NvZGU6XG4gICAgICAgICAgby5saXRlcmFsTWFwKE9iamVjdC5rZXlzKHBsYWNlaG9sZGVyVmFsdWVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgocGFyYW0pID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBmb3JtYXRJMThuUGxhY2Vob2xkZXJOYW1lKHBhcmFtKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdW90ZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG1lc3NhZ2UucGxhY2Vob2xkZXJzW3BhcmFtXSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdldCBzb3VyY2Ugc3BhbiBmb3IgdHlwaWNhbCBwbGFjZWhvbGRlciBpZiBpdCBleGlzdHMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbChtZXNzYWdlLnBsYWNlaG9sZGVyc1twYXJhbV0uc291cmNlU3Bhbi50b1N0cmluZygpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSBtdXN0IGJlIGFuIElDVSBleHByZXNzaW9uLCBnZXQgaXQncyBzb3VyY2Ugc3Bhbi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5wbGFjZWhvbGRlclRvTWVzc2FnZVtwYXJhbV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubm9kZXMubWFwKChub2RlKSA9PiBub2RlLnNvdXJjZVNwYW4udG9TdHJpbmcoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuam9pbignJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSkpLFxuICAgIH0pKTtcbiAgfVxuXG4gIC8vIC8qKlxuICAvLyAgKiBAZGVzYyBkZXNjcmlwdGlvbiBvZiBtZXNzYWdlXG4gIC8vICAqIEBtZWFuaW5nIG1lYW5pbmcgb2YgbWVzc2FnZVxuICAvLyAgKi9cbiAgLy8gY29uc3QgTVNHXy4uLiA9IGdvb2cuZ2V0TXNnKC4uKTtcbiAgLy8gSTE4Tl9YID0gTVNHXy4uLjtcbiAgY29uc3QgZ29vZ0dldE1zZ1N0bXQgPSBjbG9zdXJlVmFyLnNldChvLnZhcmlhYmxlKEdPT0dfR0VUX01TRykuY2FsbEZuKGFyZ3MpKS50b0NvbnN0RGVjbCgpO1xuICBnb29nR2V0TXNnU3RtdC5hZGRMZWFkaW5nQ29tbWVudChpMThuTWV0YVRvSlNEb2MobWVzc2FnZSkpO1xuICBjb25zdCBpMThuQXNzaWdubWVudFN0bXQgPSBuZXcgby5FeHByZXNzaW9uU3RhdGVtZW50KHZhcmlhYmxlLnNldChjbG9zdXJlVmFyKSk7XG4gIHJldHVybiBbZ29vZ0dldE1zZ1N0bXQsIGkxOG5Bc3NpZ25tZW50U3RtdF07XG59XG5cbi8qKlxuICogVGhpcyB2aXNpdG9yIHdhbGtzIG92ZXIgaTE4biB0cmVlIGFuZCBnZW5lcmF0ZXMgaXRzIHN0cmluZyByZXByZXNlbnRhdGlvbiwgaW5jbHVkaW5nIElDVXMgYW5kXG4gKiBwbGFjZWhvbGRlcnMgaW4gYHskcGxhY2Vob2xkZXJ9YCAoZm9yIHBsYWluIG1lc3NhZ2VzKSBvciBge1BMQUNFSE9MREVSfWAgKGluc2lkZSBJQ1VzKSBmb3JtYXQuXG4gKi9cbmNsYXNzIEdldE1zZ1NlcmlhbGl6ZXJWaXNpdG9yIGltcGxlbWVudHMgaTE4bi5WaXNpdG9yIHtcbiAgcHJpdmF0ZSBmb3JtYXRQaCh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYHskJHtmb3JtYXRJMThuUGxhY2Vob2xkZXJOYW1lKHZhbHVlKX19YDtcbiAgfVxuXG4gIHZpc2l0VGV4dCh0ZXh0OiBpMThuLlRleHQpOiBhbnkge1xuICAgIHJldHVybiB0ZXh0LnZhbHVlO1xuICB9XG5cbiAgdmlzaXRDb250YWluZXIoY29udGFpbmVyOiBpMThuLkNvbnRhaW5lcik6IGFueSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lci5jaGlsZHJlbi5tYXAoY2hpbGQgPT4gY2hpbGQudmlzaXQodGhpcykpLmpvaW4oJycpO1xuICB9XG5cbiAgdmlzaXRJY3UoaWN1OiBpMThuLkljdSk6IGFueSB7XG4gICAgcmV0dXJuIHNlcmlhbGl6ZUljdU5vZGUoaWN1KTtcbiAgfVxuXG4gIHZpc2l0VGFnUGxhY2Vob2xkZXIocGg6IGkxOG4uVGFnUGxhY2Vob2xkZXIpOiBhbnkge1xuICAgIHJldHVybiBwaC5pc1ZvaWQgP1xuICAgICAgICB0aGlzLmZvcm1hdFBoKHBoLnN0YXJ0TmFtZSkgOlxuICAgICAgICBgJHt0aGlzLmZvcm1hdFBoKHBoLnN0YXJ0TmFtZSl9JHtwaC5jaGlsZHJlbi5tYXAoY2hpbGQgPT4gY2hpbGQudmlzaXQodGhpcykpLmpvaW4oJycpfSR7XG4gICAgICAgICAgICB0aGlzLmZvcm1hdFBoKHBoLmNsb3NlTmFtZSl9YDtcbiAgfVxuXG4gIHZpc2l0UGxhY2Vob2xkZXIocGg6IGkxOG4uUGxhY2Vob2xkZXIpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmZvcm1hdFBoKHBoLm5hbWUpO1xuICB9XG5cbiAgdmlzaXRCbG9ja1BsYWNlaG9sZGVyKHBoOiBpMThuLkJsb2NrUGxhY2Vob2xkZXIpOiBhbnkge1xuICAgIHJldHVybiBgJHt0aGlzLmZvcm1hdFBoKHBoLnN0YXJ0TmFtZSl9JHtwaC5jaGlsZHJlbi5tYXAoY2hpbGQgPT4gY2hpbGQudmlzaXQodGhpcykpLmpvaW4oJycpfSR7XG4gICAgICAgIHRoaXMuZm9ybWF0UGgocGguY2xvc2VOYW1lKX1gO1xuICB9XG5cbiAgdmlzaXRJY3VQbGFjZWhvbGRlcihwaDogaTE4bi5JY3VQbGFjZWhvbGRlciwgY29udGV4dD86IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuZm9ybWF0UGgocGgubmFtZSk7XG4gIH1cbn1cblxuY29uc3Qgc2VyaWFsaXplclZpc2l0b3IgPSBuZXcgR2V0TXNnU2VyaWFsaXplclZpc2l0b3IoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZUkxOG5NZXNzYWdlRm9yR2V0TXNnKG1lc3NhZ2U6IGkxOG4uTWVzc2FnZSk6IHN0cmluZyB7XG4gIHJldHVybiBtZXNzYWdlLm5vZGVzLm1hcChub2RlID0+IG5vZGUudmlzaXQoc2VyaWFsaXplclZpc2l0b3IsIG51bGwpKS5qb2luKCcnKTtcbn1cbiJdfQ==
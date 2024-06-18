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
            original_code: o.literalMap(Object.keys(placeholderValues).map((param) => ({
                key: formatI18nPlaceholderName(param),
                quoted: true,
                value: message.placeholders[param]
                    ? // Get source span for typical placeholder if it exists.
                        o.literal(message.placeholders[param].sourceSpan.toString())
                    : // Otherwise must be an ICU expression, get it's source span.
                        o.literal(message.placeholderToMessage[param].nodes
                            .map((node) => node.sourceSpan.toString())
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
        return container.children.map((child) => child.visit(this)).join('');
    }
    visitIcu(icu) {
        return serializeIcuNode(icu);
    }
    visitTagPlaceholder(ph) {
        return ph.isVoid
            ? this.formatPh(ph.startName)
            : `${this.formatPh(ph.startName)}${ph.children.map((child) => child.visit(this)).join('')}${this.formatPh(ph.closeName)}`;
    }
    visitPlaceholder(ph) {
        return this.formatPh(ph.name);
    }
    visitBlockPlaceholder(ph) {
        return `${this.formatPh(ph.startName)}${ph.children.map((child) => child.visit(this)).join('')}${this.formatPh(ph.closeName)}`;
    }
    visitIcuPlaceholder(ph, context) {
        return this.formatPh(ph.name);
    }
}
const serializerVisitor = new GetMsgSerializerVisitor();
export function serializeI18nMessageForGetMsg(message) {
    return message.nodes.map((node) => node.visit(serializerVisitor, null)).join('');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0X21zZ191dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3ZpZXcvaTE4bi9nZXRfbXNnX3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNwRCxPQUFPLEtBQUssQ0FBQyxNQUFNLDRCQUE0QixDQUFDO0FBRWhELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2xELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDdkMsT0FBTyxFQUFDLHlCQUF5QixFQUFFLCtCQUErQixFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRWxGLGlFQUFpRTtBQUNqRSxNQUFNLFlBQVksR0FBRyxhQUFhLENBQUM7QUFFbkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlDRztBQUNILE1BQU0sVUFBVSw0QkFBNEIsQ0FDMUMsUUFBdUIsRUFDdkIsT0FBcUIsRUFDckIsVUFBeUIsRUFDekIsaUJBQWlEO0lBRWpELE1BQU0sYUFBYSxHQUFHLDZCQUE2QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdELE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQWlCLENBQUMsQ0FBQztJQUN4RCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMxQyxnR0FBZ0c7UUFDaEcsd0RBQXdEO1FBQ3hELElBQUksQ0FBQyxJQUFJLENBQ1AsVUFBVSxDQUNSLCtCQUErQixDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUMzRSxJQUFJLENBQUMsWUFBWSxDQUNsQixDQUNGLENBQUM7UUFFRiw0RkFBNEY7UUFDNUYsOEJB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LEVBQW9CO1FBQ25DLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVELHFCQUFxQixDQUFDLEVBQXlCO1FBQzdDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUM1RyxFQUFFLENBQUMsU0FBUyxDQUNiLEVBQUUsQ0FBQztJQUNOLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxFQUF1QixFQUFFLE9BQWE7UUFDeEQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxDQUFDO0NBQ0Y7QUFFRCxNQUFNLGlCQUFpQixHQUFHLElBQUksdUJBQXVCLEVBQUUsQ0FBQztBQUV4RCxNQUFNLFVBQVUsNkJBQTZCLENBQUMsT0FBcUI7SUFDakUsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNuRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyBpMThuIGZyb20gJy4uLy4uLy4uL2kxOG4vaTE4bl9hc3QnO1xuaW1wb3J0IHttYXBMaXRlcmFsfSBmcm9tICcuLi8uLi8uLi9vdXRwdXQvbWFwX3V0aWwnO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5cbmltcG9ydCB7c2VyaWFsaXplSWN1Tm9kZX0gZnJvbSAnLi9pY3Vfc2VyaWFsaXplcic7XG5pbXBvcnQge2kxOG5NZXRhVG9KU0RvY30gZnJvbSAnLi9tZXRhJztcbmltcG9ydCB7Zm9ybWF0STE4blBsYWNlaG9sZGVyTmFtZSwgZm9ybWF0STE4blBsYWNlaG9sZGVyTmFtZXNJbk1hcH0gZnJvbSAnLi91dGlsJztcblxuLyoqIENsb3N1cmUgdXNlcyBgZ29vZy5nZXRNc2cobWVzc2FnZSlgIHRvIGxvb2t1cCB0cmFuc2xhdGlvbnMgKi9cbmNvbnN0IEdPT0dfR0VUX01TRyA9ICdnb29nLmdldE1zZyc7XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgYGdvb2cuZ2V0TXNnKClgIHN0YXRlbWVudCBhbmQgcmVhc3NpZ25tZW50LiBUaGUgdGVtcGxhdGU6XG4gKlxuICogYGBgaHRtbFxuICogPGRpdiBpMThuPlNlbnQgZnJvbSB7eyBzZW5kZXIgfX0gdG8gPHNwYW4gY2xhc3M9XCJyZWNlaXZlclwiPnt7IHJlY2VpdmVyIH19PC9zcGFuPjwvZGl2PlxuICogYGBgXG4gKlxuICogR2VuZXJhdGVzOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IE1TR19GT08gPSBnb29nLmdldE1zZyhcbiAqICAgLy8gTWVzc2FnZSB0ZW1wbGF0ZS5cbiAqICAgJ1NlbnQgZnJvbSB7JGludGVycG9sYXRpb259IHRvIHskc3RhcnRUYWdTcGFufXskaW50ZXJwb2xhdGlvbl8xfXskY2xvc2VUYWdTcGFufS4nLFxuICogICAvLyBQbGFjZWhvbGRlciB2YWx1ZXMsIHNldCB0byBtYWdpYyBzdHJpbmdzIHdoaWNoIGdldCByZXBsYWNlZCBieSB0aGUgQW5ndWxhciBydW50aW1lLlxuICogICB7XG4gKiAgICAgJ2ludGVycG9sYXRpb24nOiAnXFx1RkZGRDBcXHVGRkZEJyxcbiAqICAgICAnc3RhcnRUYWdTcGFuJzogJ1xcdUZGRkQxXFx1RkZGRCcsXG4gKiAgICAgJ2ludGVycG9sYXRpb25fMSc6ICdcXHVGRkZEMlxcdUZGRkQnLFxuICogICAgICdjbG9zZVRhZ1NwYW4nOiAnXFx1RkZGRDNcXHVGRkZEJyxcbiAqICAgfSxcbiAqICAgLy8gT3B0aW9ucyBiYWcuXG4gKiAgIHtcbiAqICAgICAvLyBNYXBzIGVhY2ggcGxhY2Vob2xkZXIgdG8gdGhlIG9yaWdpbmFsIEFuZ3VsYXIgc291cmNlIGNvZGUgd2hpY2ggZ2VuZXJhdGVzIGl0J3MgdmFsdWUuXG4gKiAgICAgb3JpZ2luYWxfY29kZToge1xuICogICAgICAgJ2ludGVycG9sYXRpb24nOiAne3sgc2VuZGVyIH19JyxcbiAqICAgICAgICdzdGFydFRhZ1NwYW4nOiAnPHNwYW4gY2xhc3M9XCJyZWNlaXZlclwiPicsXG4gKiAgICAgICAnaW50ZXJwb2xhdGlvbl8xJzogJ3t7IHJlY2VpdmVyIH19JyxcbiAqICAgICAgICdjbG9zZVRhZ1NwYW4nOiAnPC9zcGFuPicsXG4gKiAgICAgfSxcbiAqICAgfSxcbiAqICk7XG4gKiBjb25zdCBJMThOXzAgPSBNU0dfRk9PO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVHb29nbGVHZXRNc2dTdGF0ZW1lbnRzKFxuICB2YXJpYWJsZTogby5SZWFkVmFyRXhwcixcbiAgbWVzc2FnZTogaTE4bi5NZXNzYWdlLFxuICBjbG9zdXJlVmFyOiBvLlJlYWRWYXJFeHByLFxuICBwbGFjZWhvbGRlclZhbHVlczoge1tuYW1lOiBzdHJpbmddOiBvLkV4cHJlc3Npb259LFxuKTogby5TdGF0ZW1lbnRbXSB7XG4gIGNvbnN0IG1lc3NhZ2VTdHJpbmcgPSBzZXJpYWxpemVJMThuTWVzc2FnZUZvckdldE1zZyhtZXNzYWdlKTtcbiAgY29uc3QgYXJncyA9IFtvLmxpdGVyYWwobWVzc2FnZVN0cmluZykgYXMgby5FeHByZXNzaW9uXTtcbiAgaWYgKE9iamVjdC5rZXlzKHBsYWNlaG9sZGVyVmFsdWVzKS5sZW5ndGgpIHtcbiAgICAvLyBNZXNzYWdlIHRlbXBsYXRlIHBhcmFtZXRlcnMgY29udGFpbmluZyB0aGUgbWFnaWMgc3RyaW5ncyByZXBsYWNlZCBieSB0aGUgQW5ndWxhciBydW50aW1lIHdpdGhcbiAgICAvLyByZWFsIGRhdGEsIGUuZy4gYHsnaW50ZXJwb2xhdGlvbic6ICdcXHVGRkZEMFxcdUZGRkQnfWAuXG4gICAgYXJncy5wdXNoKFxuICAgICAgbWFwTGl0ZXJhbChcbiAgICAgICAgZm9ybWF0STE4blBsYWNlaG9sZGVyTmFtZXNJbk1hcChwbGFjZWhvbGRlclZhbHVlcywgdHJ1ZSAvKiB1c2VDYW1lbENhc2UgKi8pLFxuICAgICAgICB0cnVlIC8qIHF1b3RlZCAqLyxcbiAgICAgICksXG4gICAgKTtcblxuICAgIC8vIE1lc3NhZ2Ugb3B0aW9ucyBvYmplY3QsIHdoaWNoIGNvbnRhaW5zIG9yaWdpbmFsIHNvdXJjZSBjb2RlIGZvciBwbGFjZWhvbGRlcnMgKGFzIHRoZXkgYXJlXG4gICAgLy8gcHJlc2VudCBpbiBhIHRlbXBsYXRlLCBlLmcuXG4gICAgLy8gYHtvcmlnaW5hbF9jb2RlOiB7J2ludGVycG9sYXRpb24nOiAne3sgbmFtZSB9fScsICdzdGFydFRhZ1NwYW4nOiAnPHNwYW4+J319YC5cbiAgICBhcmdzLnB1c2goXG4gICAgICBtYXBMaXRlcmFsKHtcbiAgICAgICAgb3JpZ2luYWxfY29kZTogby5saXRlcmFsTWFwKFxuICAgICAgICAgIE9iamVjdC5rZXlzKHBsYWNlaG9sZGVyVmFsdWVzKS5tYXAoKHBhcmFtKSA9PiAoe1xuICAgICAgICAgICAga2V5OiBmb3JtYXRJMThuUGxhY2Vob2xkZXJOYW1lKHBhcmFtKSxcbiAgICAgICAgICAgIHF1b3RlZDogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBtZXNzYWdlLnBsYWNlaG9sZGVyc1twYXJhbV1cbiAgICAgICAgICAgICAgPyAvLyBHZXQgc291cmNlIHNwYW4gZm9yIHR5cGljYWwgcGxhY2Vob2xkZXIgaWYgaXQgZXhpc3RzLlxuICAgICAgICAgICAgICAgIG8ubGl0ZXJhbChtZXNzYWdlLnBsYWNlaG9sZGVyc1twYXJhbV0uc291cmNlU3Bhbi50b1N0cmluZygpKVxuICAgICAgICAgICAgICA6IC8vIE90aGVyd2lzZSBtdXN0IGJlIGFuIElDVSBleHByZXNzaW9uLCBnZXQgaXQncyBzb3VyY2Ugc3Bhbi5cbiAgICAgICAgICAgICAgICBvLmxpdGVyYWwoXG4gICAgICAgICAgICAgICAgICBtZXNzYWdlLnBsYWNlaG9sZGVyVG9NZXNzYWdlW3BhcmFtXS5ub2Rlc1xuICAgICAgICAgICAgICAgICAgICAubWFwKChub2RlKSA9PiBub2RlLnNvdXJjZVNwYW4udG9TdHJpbmcoKSlcbiAgICAgICAgICAgICAgICAgICAgLmpvaW4oJycpLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgfSkpLFxuICAgICAgICApLFxuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIC8vIC8qKlxuICAvLyAgKiBAZGVzYyBkZXNjcmlwdGlvbiBvZiBtZXNzYWdlXG4gIC8vICAqIEBtZWFuaW5nIG1lYW5pbmcgb2YgbWVzc2FnZVxuICAvLyAgKi9cbiAgLy8gY29uc3QgTVNHXy4uLiA9IGdvb2cuZ2V0TXNnKC4uKTtcbiAgLy8gSTE4Tl9YID0gTVNHXy4uLjtcbiAgY29uc3QgZ29vZ0dldE1zZ1N0bXQgPSBjbG9zdXJlVmFyLnNldChvLnZhcmlhYmxlKEdPT0dfR0VUX01TRykuY2FsbEZuKGFyZ3MpKS50b0NvbnN0RGVjbCgpO1xuICBnb29nR2V0TXNnU3RtdC5hZGRMZWFkaW5nQ29tbWVudChpMThuTWV0YVRvSlNEb2MobWVzc2FnZSkpO1xuICBjb25zdCBpMThuQXNzaWdubWVudFN0bXQgPSBuZXcgby5FeHByZXNzaW9uU3RhdGVtZW50KHZhcmlhYmxlLnNldChjbG9zdXJlVmFyKSk7XG4gIHJldHVybiBbZ29vZ0dldE1zZ1N0bXQsIGkxOG5Bc3NpZ25tZW50U3RtdF07XG59XG5cbi8qKlxuICogVGhpcyB2aXNpdG9yIHdhbGtzIG92ZXIgaTE4biB0cmVlIGFuZCBnZW5lcmF0ZXMgaXRzIHN0cmluZyByZXByZXNlbnRhdGlvbiwgaW5jbHVkaW5nIElDVXMgYW5kXG4gKiBwbGFjZWhvbGRlcnMgaW4gYHskcGxhY2Vob2xkZXJ9YCAoZm9yIHBsYWluIG1lc3NhZ2VzKSBvciBge1BMQUNFSE9MREVSfWAgKGluc2lkZSBJQ1VzKSBmb3JtYXQuXG4gKi9cbmNsYXNzIEdldE1zZ1NlcmlhbGl6ZXJWaXNpdG9yIGltcGxlbWVudHMgaTE4bi5WaXNpdG9yIHtcbiAgcHJpdmF0ZSBmb3JtYXRQaCh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYHskJHtmb3JtYXRJMThuUGxhY2Vob2xkZXJOYW1lKHZhbHVlKX19YDtcbiAgfVxuXG4gIHZpc2l0VGV4dCh0ZXh0OiBpMThuLlRleHQpOiBhbnkge1xuICAgIHJldHVybiB0ZXh0LnZhbHVlO1xuICB9XG5cbiAgdmlzaXRDb250YWluZXIoY29udGFpbmVyOiBpMThuLkNvbnRhaW5lcik6IGFueSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lci5jaGlsZHJlbi5tYXAoKGNoaWxkKSA9PiBjaGlsZC52aXNpdCh0aGlzKSkuam9pbignJyk7XG4gIH1cblxuICB2aXNpdEljdShpY3U6IGkxOG4uSWN1KTogYW55IHtcbiAgICByZXR1cm4gc2VyaWFsaXplSWN1Tm9kZShpY3UpO1xuICB9XG5cbiAgdmlzaXRUYWdQbGFjZWhvbGRlcihwaDogaTE4bi5UYWdQbGFjZWhvbGRlcik6IGFueSB7XG4gICAgcmV0dXJuIHBoLmlzVm9pZFxuICAgICAgPyB0aGlzLmZvcm1hdFBoKHBoLnN0YXJ0TmFtZSlcbiAgICAgIDogYCR7dGhpcy5mb3JtYXRQaChwaC5zdGFydE5hbWUpfSR7cGguY2hpbGRyZW4ubWFwKChjaGlsZCkgPT4gY2hpbGQudmlzaXQodGhpcykpLmpvaW4oJycpfSR7dGhpcy5mb3JtYXRQaChcbiAgICAgICAgICBwaC5jbG9zZU5hbWUsXG4gICAgICAgICl9YDtcbiAgfVxuXG4gIHZpc2l0UGxhY2Vob2xkZXIocGg6IGkxOG4uUGxhY2Vob2xkZXIpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmZvcm1hdFBoKHBoLm5hbWUpO1xuICB9XG5cbiAgdmlzaXRCbG9ja1BsYWNlaG9sZGVyKHBoOiBpMThuLkJsb2NrUGxhY2Vob2xkZXIpOiBhbnkge1xuICAgIHJldHVybiBgJHt0aGlzLmZvcm1hdFBoKHBoLnN0YXJ0TmFtZSl9JHtwaC5jaGlsZHJlbi5tYXAoKGNoaWxkKSA9PiBjaGlsZC52aXNpdCh0aGlzKSkuam9pbignJyl9JHt0aGlzLmZvcm1hdFBoKFxuICAgICAgcGguY2xvc2VOYW1lLFxuICAgICl9YDtcbiAgfVxuXG4gIHZpc2l0SWN1UGxhY2Vob2xkZXIocGg6IGkxOG4uSWN1UGxhY2Vob2xkZXIsIGNvbnRleHQ/OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmZvcm1hdFBoKHBoLm5hbWUpO1xuICB9XG59XG5cbmNvbnN0IHNlcmlhbGl6ZXJWaXNpdG9yID0gbmV3IEdldE1zZ1NlcmlhbGl6ZXJWaXNpdG9yKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVJMThuTWVzc2FnZUZvckdldE1zZyhtZXNzYWdlOiBpMThuLk1lc3NhZ2UpOiBzdHJpbmcge1xuICByZXR1cm4gbWVzc2FnZS5ub2Rlcy5tYXAoKG5vZGUpID0+IG5vZGUudmlzaXQoc2VyaWFsaXplclZpc2l0b3IsIG51bGwpKS5qb2luKCcnKTtcbn1cbiJdfQ==
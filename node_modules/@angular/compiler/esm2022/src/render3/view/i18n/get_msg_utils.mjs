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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0X21zZ191dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3ZpZXcvaTE4bi9nZXRfbXNnX3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNwRCxPQUFPLEtBQUssQ0FBQyxNQUFNLDRCQUE0QixDQUFDO0FBRWhELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2xELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDdkMsT0FBTyxFQUFDLHlCQUF5QixFQUFFLCtCQUErQixFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRWxGLGlFQUFpRTtBQUNqRSxNQUFNLFlBQVksR0FBRyxhQUFhLENBQUM7QUFFbkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlDRztBQUNILE1BQU0sVUFBVSw0QkFBNEIsQ0FDMUMsUUFBdUIsRUFDdkIsT0FBcUIsRUFDckIsVUFBeUIsRUFDekIsaUJBQWlEO0lBRWpELE1BQU0sYUFBYSxHQUFHLDZCQUE2QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdELE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQWlCLENBQUMsQ0FBQztJQUN4RCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMxQyxnR0FBZ0c7UUFDaEcsd0RBQXdEO1FBQ3hELElBQUksQ0FBQyxJQUFJLENBQ1AsVUFBVSxDQUNSLCtCQUErQixDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUMzRSxJQUFJLENBQUMsWUFBWSxDQUNsQixDQUNGLENBQUM7UUFFRiw0RkFBNEY7UUFDNUYsOEJB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LEVBQW9CO1FBQ25DLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVELHFCQUFxQixDQUFDLEVBQXlCO1FBQzdDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUM1RyxFQUFFLENBQUMsU0FBUyxDQUNiLEVBQUUsQ0FBQztJQUNOLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxFQUF1QixFQUFFLE9BQWE7UUFDeEQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxDQUFDO0NBQ0Y7QUFFRCxNQUFNLGlCQUFpQixHQUFHLElBQUksdUJBQXVCLEVBQUUsQ0FBQztBQUV4RCxNQUFNLFVBQVUsNkJBQTZCLENBQUMsT0FBcUI7SUFDakUsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNuRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgaTE4biBmcm9tICcuLi8uLi8uLi9pMThuL2kxOG5fYXN0JztcbmltcG9ydCB7bWFwTGl0ZXJhbH0gZnJvbSAnLi4vLi4vLi4vb3V0cHV0L21hcF91dGlsJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuXG5pbXBvcnQge3NlcmlhbGl6ZUljdU5vZGV9IGZyb20gJy4vaWN1X3NlcmlhbGl6ZXInO1xuaW1wb3J0IHtpMThuTWV0YVRvSlNEb2N9IGZyb20gJy4vbWV0YSc7XG5pbXBvcnQge2Zvcm1hdEkxOG5QbGFjZWhvbGRlck5hbWUsIGZvcm1hdEkxOG5QbGFjZWhvbGRlck5hbWVzSW5NYXB9IGZyb20gJy4vdXRpbCc7XG5cbi8qKiBDbG9zdXJlIHVzZXMgYGdvb2cuZ2V0TXNnKG1lc3NhZ2UpYCB0byBsb29rdXAgdHJhbnNsYXRpb25zICovXG5jb25zdCBHT09HX0dFVF9NU0cgPSAnZ29vZy5nZXRNc2cnO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGBnb29nLmdldE1zZygpYCBzdGF0ZW1lbnQgYW5kIHJlYXNzaWdubWVudC4gVGhlIHRlbXBsYXRlOlxuICpcbiAqIGBgYGh0bWxcbiAqIDxkaXYgaTE4bj5TZW50IGZyb20ge3sgc2VuZGVyIH19IHRvIDxzcGFuIGNsYXNzPVwicmVjZWl2ZXJcIj57eyByZWNlaXZlciB9fTwvc3Bhbj48L2Rpdj5cbiAqIGBgYFxuICpcbiAqIEdlbmVyYXRlczpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCBNU0dfRk9PID0gZ29vZy5nZXRNc2coXG4gKiAgIC8vIE1lc3NhZ2UgdGVtcGxhdGUuXG4gKiAgICdTZW50IGZyb20geyRpbnRlcnBvbGF0aW9ufSB0byB7JHN0YXJ0VGFnU3Bhbn17JGludGVycG9sYXRpb25fMX17JGNsb3NlVGFnU3Bhbn0uJyxcbiAqICAgLy8gUGxhY2Vob2xkZXIgdmFsdWVzLCBzZXQgdG8gbWFnaWMgc3RyaW5ncyB3aGljaCBnZXQgcmVwbGFjZWQgYnkgdGhlIEFuZ3VsYXIgcnVudGltZS5cbiAqICAge1xuICogICAgICdpbnRlcnBvbGF0aW9uJzogJ1xcdUZGRkQwXFx1RkZGRCcsXG4gKiAgICAgJ3N0YXJ0VGFnU3Bhbic6ICdcXHVGRkZEMVxcdUZGRkQnLFxuICogICAgICdpbnRlcnBvbGF0aW9uXzEnOiAnXFx1RkZGRDJcXHVGRkZEJyxcbiAqICAgICAnY2xvc2VUYWdTcGFuJzogJ1xcdUZGRkQzXFx1RkZGRCcsXG4gKiAgIH0sXG4gKiAgIC8vIE9wdGlvbnMgYmFnLlxuICogICB7XG4gKiAgICAgLy8gTWFwcyBlYWNoIHBsYWNlaG9sZGVyIHRvIHRoZSBvcmlnaW5hbCBBbmd1bGFyIHNvdXJjZSBjb2RlIHdoaWNoIGdlbmVyYXRlcyBpdCdzIHZhbHVlLlxuICogICAgIG9yaWdpbmFsX2NvZGU6IHtcbiAqICAgICAgICdpbnRlcnBvbGF0aW9uJzogJ3t7IHNlbmRlciB9fScsXG4gKiAgICAgICAnc3RhcnRUYWdTcGFuJzogJzxzcGFuIGNsYXNzPVwicmVjZWl2ZXJcIj4nLFxuICogICAgICAgJ2ludGVycG9sYXRpb25fMSc6ICd7eyByZWNlaXZlciB9fScsXG4gKiAgICAgICAnY2xvc2VUYWdTcGFuJzogJzwvc3Bhbj4nLFxuICogICAgIH0sXG4gKiAgIH0sXG4gKiApO1xuICogY29uc3QgSTE4Tl8wID0gTVNHX0ZPTztcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlR29vZ2xlR2V0TXNnU3RhdGVtZW50cyhcbiAgdmFyaWFibGU6IG8uUmVhZFZhckV4cHIsXG4gIG1lc3NhZ2U6IGkxOG4uTWVzc2FnZSxcbiAgY2xvc3VyZVZhcjogby5SZWFkVmFyRXhwcixcbiAgcGxhY2Vob2xkZXJWYWx1ZXM6IHtbbmFtZTogc3RyaW5nXTogby5FeHByZXNzaW9ufSxcbik6IG8uU3RhdGVtZW50W10ge1xuICBjb25zdCBtZXNzYWdlU3RyaW5nID0gc2VyaWFsaXplSTE4bk1lc3NhZ2VGb3JHZXRNc2cobWVzc2FnZSk7XG4gIGNvbnN0IGFyZ3MgPSBbby5saXRlcmFsKG1lc3NhZ2VTdHJpbmcpIGFzIG8uRXhwcmVzc2lvbl07XG4gIGlmIChPYmplY3Qua2V5cyhwbGFjZWhvbGRlclZhbHVlcykubGVuZ3RoKSB7XG4gICAgLy8gTWVzc2FnZSB0ZW1wbGF0ZSBwYXJhbWV0ZXJzIGNvbnRhaW5pbmcgdGhlIG1hZ2ljIHN0cmluZ3MgcmVwbGFjZWQgYnkgdGhlIEFuZ3VsYXIgcnVudGltZSB3aXRoXG4gICAgLy8gcmVhbCBkYXRhLCBlLmcuIGB7J2ludGVycG9sYXRpb24nOiAnXFx1RkZGRDBcXHVGRkZEJ31gLlxuICAgIGFyZ3MucHVzaChcbiAgICAgIG1hcExpdGVyYWwoXG4gICAgICAgIGZvcm1hdEkxOG5QbGFjZWhvbGRlck5hbWVzSW5NYXAocGxhY2Vob2xkZXJWYWx1ZXMsIHRydWUgLyogdXNlQ2FtZWxDYXNlICovKSxcbiAgICAgICAgdHJ1ZSAvKiBxdW90ZWQgKi8sXG4gICAgICApLFxuICAgICk7XG5cbiAgICAvLyBNZXNzYWdlIG9wdGlvbnMgb2JqZWN0LCB3aGljaCBjb250YWlucyBvcmlnaW5hbCBzb3VyY2UgY29kZSBmb3IgcGxhY2Vob2xkZXJzIChhcyB0aGV5IGFyZVxuICAgIC8vIHByZXNlbnQgaW4gYSB0ZW1wbGF0ZSwgZS5nLlxuICAgIC8vIGB7b3JpZ2luYWxfY29kZTogeydpbnRlcnBvbGF0aW9uJzogJ3t7IG5hbWUgfX0nLCAnc3RhcnRUYWdTcGFuJzogJzxzcGFuPid9fWAuXG4gICAgYXJncy5wdXNoKFxuICAgICAgbWFwTGl0ZXJhbCh7XG4gICAgICAgIG9yaWdpbmFsX2NvZGU6IG8ubGl0ZXJhbE1hcChcbiAgICAgICAgICBPYmplY3Qua2V5cyhwbGFjZWhvbGRlclZhbHVlcykubWFwKChwYXJhbSkgPT4gKHtcbiAgICAgICAgICAgIGtleTogZm9ybWF0STE4blBsYWNlaG9sZGVyTmFtZShwYXJhbSksXG4gICAgICAgICAgICBxdW90ZWQ6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogbWVzc2FnZS5wbGFjZWhvbGRlcnNbcGFyYW1dXG4gICAgICAgICAgICAgID8gLy8gR2V0IHNvdXJjZSBzcGFuIGZvciB0eXBpY2FsIHBsYWNlaG9sZGVyIGlmIGl0IGV4aXN0cy5cbiAgICAgICAgICAgICAgICBvLmxpdGVyYWwobWVzc2FnZS5wbGFjZWhvbGRlcnNbcGFyYW1dLnNvdXJjZVNwYW4udG9TdHJpbmcoKSlcbiAgICAgICAgICAgICAgOiAvLyBPdGhlcndpc2UgbXVzdCBiZSBhbiBJQ1UgZXhwcmVzc2lvbiwgZ2V0IGl0J3Mgc291cmNlIHNwYW4uXG4gICAgICAgICAgICAgICAgby5saXRlcmFsKFxuICAgICAgICAgICAgICAgICAgbWVzc2FnZS5wbGFjZWhvbGRlclRvTWVzc2FnZVtwYXJhbV0ubm9kZXNcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgobm9kZSkgPT4gbm9kZS5zb3VyY2VTcGFuLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAgICAgICAgIC5qb2luKCcnKSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgIH0pKSxcbiAgICAgICAgKSxcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICAvLyAvKipcbiAgLy8gICogQGRlc2MgZGVzY3JpcHRpb24gb2YgbWVzc2FnZVxuICAvLyAgKiBAbWVhbmluZyBtZWFuaW5nIG9mIG1lc3NhZ2VcbiAgLy8gICovXG4gIC8vIGNvbnN0IE1TR18uLi4gPSBnb29nLmdldE1zZyguLik7XG4gIC8vIEkxOE5fWCA9IE1TR18uLi47XG4gIGNvbnN0IGdvb2dHZXRNc2dTdG10ID0gY2xvc3VyZVZhci5zZXQoby52YXJpYWJsZShHT09HX0dFVF9NU0cpLmNhbGxGbihhcmdzKSkudG9Db25zdERlY2woKTtcbiAgZ29vZ0dldE1zZ1N0bXQuYWRkTGVhZGluZ0NvbW1lbnQoaTE4bk1ldGFUb0pTRG9jKG1lc3NhZ2UpKTtcbiAgY29uc3QgaTE4bkFzc2lnbm1lbnRTdG10ID0gbmV3IG8uRXhwcmVzc2lvblN0YXRlbWVudCh2YXJpYWJsZS5zZXQoY2xvc3VyZVZhcikpO1xuICByZXR1cm4gW2dvb2dHZXRNc2dTdG10LCBpMThuQXNzaWdubWVudFN0bXRdO1xufVxuXG4vKipcbiAqIFRoaXMgdmlzaXRvciB3YWxrcyBvdmVyIGkxOG4gdHJlZSBhbmQgZ2VuZXJhdGVzIGl0cyBzdHJpbmcgcmVwcmVzZW50YXRpb24sIGluY2x1ZGluZyBJQ1VzIGFuZFxuICogcGxhY2Vob2xkZXJzIGluIGB7JHBsYWNlaG9sZGVyfWAgKGZvciBwbGFpbiBtZXNzYWdlcykgb3IgYHtQTEFDRUhPTERFUn1gIChpbnNpZGUgSUNVcykgZm9ybWF0LlxuICovXG5jbGFzcyBHZXRNc2dTZXJpYWxpemVyVmlzaXRvciBpbXBsZW1lbnRzIGkxOG4uVmlzaXRvciB7XG4gIHByaXZhdGUgZm9ybWF0UGgodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGB7JCR7Zm9ybWF0STE4blBsYWNlaG9sZGVyTmFtZSh2YWx1ZSl9fWA7XG4gIH1cblxuICB2aXNpdFRleHQodGV4dDogaTE4bi5UZXh0KTogYW55IHtcbiAgICByZXR1cm4gdGV4dC52YWx1ZTtcbiAgfVxuXG4gIHZpc2l0Q29udGFpbmVyKGNvbnRhaW5lcjogaTE4bi5Db250YWluZXIpOiBhbnkge1xuICAgIHJldHVybiBjb250YWluZXIuY2hpbGRyZW4ubWFwKChjaGlsZCkgPT4gY2hpbGQudmlzaXQodGhpcykpLmpvaW4oJycpO1xuICB9XG5cbiAgdmlzaXRJY3UoaWN1OiBpMThuLkljdSk6IGFueSB7XG4gICAgcmV0dXJuIHNlcmlhbGl6ZUljdU5vZGUoaWN1KTtcbiAgfVxuXG4gIHZpc2l0VGFnUGxhY2Vob2xkZXIocGg6IGkxOG4uVGFnUGxhY2Vob2xkZXIpOiBhbnkge1xuICAgIHJldHVybiBwaC5pc1ZvaWRcbiAgICAgID8gdGhpcy5mb3JtYXRQaChwaC5zdGFydE5hbWUpXG4gICAgICA6IGAke3RoaXMuZm9ybWF0UGgocGguc3RhcnROYW1lKX0ke3BoLmNoaWxkcmVuLm1hcCgoY2hpbGQpID0+IGNoaWxkLnZpc2l0KHRoaXMpKS5qb2luKCcnKX0ke3RoaXMuZm9ybWF0UGgoXG4gICAgICAgICAgcGguY2xvc2VOYW1lLFxuICAgICAgICApfWA7XG4gIH1cblxuICB2aXNpdFBsYWNlaG9sZGVyKHBoOiBpMThuLlBsYWNlaG9sZGVyKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5mb3JtYXRQaChwaC5uYW1lKTtcbiAgfVxuXG4gIHZpc2l0QmxvY2tQbGFjZWhvbGRlcihwaDogaTE4bi5CbG9ja1BsYWNlaG9sZGVyKTogYW55IHtcbiAgICByZXR1cm4gYCR7dGhpcy5mb3JtYXRQaChwaC5zdGFydE5hbWUpfSR7cGguY2hpbGRyZW4ubWFwKChjaGlsZCkgPT4gY2hpbGQudmlzaXQodGhpcykpLmpvaW4oJycpfSR7dGhpcy5mb3JtYXRQaChcbiAgICAgIHBoLmNsb3NlTmFtZSxcbiAgICApfWA7XG4gIH1cblxuICB2aXNpdEljdVBsYWNlaG9sZGVyKHBoOiBpMThuLkljdVBsYWNlaG9sZGVyLCBjb250ZXh0PzogYW55KTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5mb3JtYXRQaChwaC5uYW1lKTtcbiAgfVxufVxuXG5jb25zdCBzZXJpYWxpemVyVmlzaXRvciA9IG5ldyBHZXRNc2dTZXJpYWxpemVyVmlzaXRvcigpO1xuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplSTE4bk1lc3NhZ2VGb3JHZXRNc2cobWVzc2FnZTogaTE4bi5NZXNzYWdlKTogc3RyaW5nIHtcbiAgcmV0dXJuIG1lc3NhZ2Uubm9kZXMubWFwKChub2RlKSA9PiBub2RlLnZpc2l0KHNlcmlhbGl6ZXJWaXNpdG9yLCBudWxsKSkuam9pbignJyk7XG59XG4iXX0=
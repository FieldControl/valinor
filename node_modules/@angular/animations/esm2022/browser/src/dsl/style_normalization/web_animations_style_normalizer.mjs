/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { invalidCssUnitValue } from '../../error_helpers';
import { dashCaseToCamelCase } from '../../util';
import { AnimationStyleNormalizer } from './animation_style_normalizer';
const DIMENSIONAL_PROP_SET = new Set([
    'width',
    'height',
    'minWidth',
    'minHeight',
    'maxWidth',
    'maxHeight',
    'left',
    'top',
    'bottom',
    'right',
    'fontSize',
    'outlineWidth',
    'outlineOffset',
    'paddingTop',
    'paddingLeft',
    'paddingBottom',
    'paddingRight',
    'marginTop',
    'marginLeft',
    'marginBottom',
    'marginRight',
    'borderRadius',
    'borderWidth',
    'borderTopWidth',
    'borderLeftWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'textIndent',
    'perspective',
]);
export class WebAnimationsStyleNormalizer extends AnimationStyleNormalizer {
    normalizePropertyName(propertyName, errors) {
        return dashCaseToCamelCase(propertyName);
    }
    normalizeStyleValue(userProvidedProperty, normalizedProperty, value, errors) {
        let unit = '';
        const strVal = value.toString().trim();
        if (DIMENSIONAL_PROP_SET.has(normalizedProperty) && value !== 0 && value !== '0') {
            if (typeof value === 'number') {
                unit = 'px';
            }
            else {
                const valAndSuffixMatch = value.match(/^[+-]?[\d\.]+([a-z]*)$/);
                if (valAndSuffixMatch && valAndSuffixMatch[1].length == 0) {
                    errors.push(invalidCssUnitValue(userProvidedProperty, value));
                }
            }
        }
        return strVal + unit;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViX2FuaW1hdGlvbnNfc3R5bGVfbm9ybWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvZHNsL3N0eWxlX25vcm1hbGl6YXRpb24vd2ViX2FuaW1hdGlvbnNfc3R5bGVfbm9ybWFsaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN4RCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFFL0MsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFFdEUsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsQ0FBQztJQUNuQyxPQUFPO0lBQ1AsUUFBUTtJQUNSLFVBQVU7SUFDVixXQUFXO0lBQ1gsVUFBVTtJQUNWLFdBQVc7SUFDWCxNQUFNO0lBQ04sS0FBSztJQUNMLFFBQVE7SUFDUixPQUFPO0lBQ1AsVUFBVTtJQUNWLGNBQWM7SUFDZCxlQUFlO0lBQ2YsWUFBWTtJQUNaLGFBQWE7SUFDYixlQUFlO0lBQ2YsY0FBYztJQUNkLFdBQVc7SUFDWCxZQUFZO0lBQ1osY0FBYztJQUNkLGFBQWE7SUFDYixjQUFjO0lBQ2QsYUFBYTtJQUNiLGdCQUFnQjtJQUNoQixpQkFBaUI7SUFDakIsa0JBQWtCO0lBQ2xCLG1CQUFtQjtJQUNuQixZQUFZO0lBQ1osYUFBYTtDQUNkLENBQUMsQ0FBQztBQUVILE1BQU0sT0FBTyw0QkFBNkIsU0FBUSx3QkFBd0I7SUFDL0QscUJBQXFCLENBQUMsWUFBb0IsRUFBRSxNQUFlO1FBQ2xFLE9BQU8sbUJBQW1CLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVRLG1CQUFtQixDQUMxQixvQkFBNEIsRUFDNUIsa0JBQTBCLEVBQzFCLEtBQXNCLEVBQ3RCLE1BQWU7UUFFZixJQUFJLElBQUksR0FBVyxFQUFFLENBQUM7UUFDdEIsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXZDLElBQUksb0JBQW9CLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDakYsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNkLENBQUM7aUJBQU0sQ0FBQztnQkFDTixNQUFNLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztnQkFDaEUsSUFBSSxpQkFBaUIsSUFBSSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUM7b0JBQzFELE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDaEUsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBQ0QsT0FBTyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cbmltcG9ydCB7aW52YWxpZENzc1VuaXRWYWx1ZX0gZnJvbSAnLi4vLi4vZXJyb3JfaGVscGVycyc7XG5pbXBvcnQge2Rhc2hDYXNlVG9DYW1lbENhc2V9IGZyb20gJy4uLy4uL3V0aWwnO1xuXG5pbXBvcnQge0FuaW1hdGlvblN0eWxlTm9ybWFsaXplcn0gZnJvbSAnLi9hbmltYXRpb25fc3R5bGVfbm9ybWFsaXplcic7XG5cbmNvbnN0IERJTUVOU0lPTkFMX1BST1BfU0VUID0gbmV3IFNldChbXG4gICd3aWR0aCcsXG4gICdoZWlnaHQnLFxuICAnbWluV2lkdGgnLFxuICAnbWluSGVpZ2h0JyxcbiAgJ21heFdpZHRoJyxcbiAgJ21heEhlaWdodCcsXG4gICdsZWZ0JyxcbiAgJ3RvcCcsXG4gICdib3R0b20nLFxuICAncmlnaHQnLFxuICAnZm9udFNpemUnLFxuICAnb3V0bGluZVdpZHRoJyxcbiAgJ291dGxpbmVPZmZzZXQnLFxuICAncGFkZGluZ1RvcCcsXG4gICdwYWRkaW5nTGVmdCcsXG4gICdwYWRkaW5nQm90dG9tJyxcbiAgJ3BhZGRpbmdSaWdodCcsXG4gICdtYXJnaW5Ub3AnLFxuICAnbWFyZ2luTGVmdCcsXG4gICdtYXJnaW5Cb3R0b20nLFxuICAnbWFyZ2luUmlnaHQnLFxuICAnYm9yZGVyUmFkaXVzJyxcbiAgJ2JvcmRlcldpZHRoJyxcbiAgJ2JvcmRlclRvcFdpZHRoJyxcbiAgJ2JvcmRlckxlZnRXaWR0aCcsXG4gICdib3JkZXJSaWdodFdpZHRoJyxcbiAgJ2JvcmRlckJvdHRvbVdpZHRoJyxcbiAgJ3RleHRJbmRlbnQnLFxuICAncGVyc3BlY3RpdmUnLFxuXSk7XG5cbmV4cG9ydCBjbGFzcyBXZWJBbmltYXRpb25zU3R5bGVOb3JtYWxpemVyIGV4dGVuZHMgQW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyIHtcbiAgb3ZlcnJpZGUgbm9ybWFsaXplUHJvcGVydHlOYW1lKHByb3BlcnR5TmFtZTogc3RyaW5nLCBlcnJvcnM6IEVycm9yW10pOiBzdHJpbmcge1xuICAgIHJldHVybiBkYXNoQ2FzZVRvQ2FtZWxDYXNlKHByb3BlcnR5TmFtZSk7XG4gIH1cblxuICBvdmVycmlkZSBub3JtYWxpemVTdHlsZVZhbHVlKFxuICAgIHVzZXJQcm92aWRlZFByb3BlcnR5OiBzdHJpbmcsXG4gICAgbm9ybWFsaXplZFByb3BlcnR5OiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyB8IG51bWJlcixcbiAgICBlcnJvcnM6IEVycm9yW10sXG4gICk6IHN0cmluZyB7XG4gICAgbGV0IHVuaXQ6IHN0cmluZyA9ICcnO1xuICAgIGNvbnN0IHN0clZhbCA9IHZhbHVlLnRvU3RyaW5nKCkudHJpbSgpO1xuXG4gICAgaWYgKERJTUVOU0lPTkFMX1BST1BfU0VULmhhcyhub3JtYWxpemVkUHJvcGVydHkpICYmIHZhbHVlICE9PSAwICYmIHZhbHVlICE9PSAnMCcpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHVuaXQgPSAncHgnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgdmFsQW5kU3VmZml4TWF0Y2ggPSB2YWx1ZS5tYXRjaCgvXlsrLV0/W1xcZFxcLl0rKFthLXpdKikkLyk7XG4gICAgICAgIGlmICh2YWxBbmRTdWZmaXhNYXRjaCAmJiB2YWxBbmRTdWZmaXhNYXRjaFsxXS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgIGVycm9ycy5wdXNoKGludmFsaWRDc3NVbml0VmFsdWUodXNlclByb3ZpZGVkUHJvcGVydHksIHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0clZhbCArIHVuaXQ7XG4gIH1cbn1cbiJdfQ==
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, SecurityContext } from '../core';
import { isNgContainer, isNgContent } from '../ml_parser/tags';
import { dashCaseToCamelCase } from '../util';
import { SECURITY_SCHEMA } from './dom_security_schema';
import { ElementSchemaRegistry } from './element_schema_registry';
const BOOLEAN = 'boolean';
const NUMBER = 'number';
const STRING = 'string';
const OBJECT = 'object';
/**
 * This array represents the DOM schema. It encodes inheritance, properties, and events.
 *
 * ## Overview
 *
 * Each line represents one kind of element. The `element_inheritance` and properties are joined
 * using `element_inheritance|properties` syntax.
 *
 * ## Element Inheritance
 *
 * The `element_inheritance` can be further subdivided as `element1,element2,...^parentElement`.
 * Here the individual elements are separated by `,` (commas). Every element in the list
 * has identical properties.
 *
 * An `element` may inherit additional properties from `parentElement` If no `^parentElement` is
 * specified then `""` (blank) element is assumed.
 *
 * NOTE: The blank element inherits from root `[Element]` element, the super element of all
 * elements.
 *
 * NOTE an element prefix such as `:svg:` has no special meaning to the schema.
 *
 * ## Properties
 *
 * Each element has a set of properties separated by `,` (commas). Each property can be prefixed
 * by a special character designating its type:
 *
 * - (no prefix): property is a string.
 * - `*`: property represents an event.
 * - `!`: property is a boolean.
 * - `#`: property is a number.
 * - `%`: property is an object.
 *
 * ## Query
 *
 * The class creates an internal squas representation which allows to easily answer the query of
 * if a given property exist on a given element.
 *
 * NOTE: We don't yet support querying for types or events.
 * NOTE: This schema is auto extracted from `schema_extractor.ts` located in the test folder,
 *       see dom_element_schema_registry_spec.ts
 */
// =================================================================================================
// =================================================================================================
// =========== S T O P   -  S T O P   -  S T O P   -  S T O P   -  S T O P   -  S T O P  ===========
// =================================================================================================
// =================================================================================================
//
//                       DO NOT EDIT THIS DOM SCHEMA WITHOUT A SECURITY REVIEW!
//
// Newly added properties must be security reviewed and assigned an appropriate SecurityContext in
// dom_security_schema.ts. Reach out to mprobst & rjamet for details.
//
// =================================================================================================
const SCHEMA = [
    '[Element]|textContent,%ariaAtomic,%ariaAutoComplete,%ariaBusy,%ariaChecked,%ariaColCount,%ariaColIndex,%ariaColSpan,%ariaCurrent,%ariaDescription,%ariaDisabled,%ariaExpanded,%ariaHasPopup,%ariaHidden,%ariaKeyShortcuts,%ariaLabel,%ariaLevel,%ariaLive,%ariaModal,%ariaMultiLine,%ariaMultiSelectable,%ariaOrientation,%ariaPlaceholder,%ariaPosInSet,%ariaPressed,%ariaReadOnly,%ariaRelevant,%ariaRequired,%ariaRoleDescription,%ariaRowCount,%ariaRowIndex,%ariaRowSpan,%ariaSelected,%ariaSetSize,%ariaSort,%ariaValueMax,%ariaValueMin,%ariaValueNow,%ariaValueText,%classList,className,elementTiming,id,innerHTML,*beforecopy,*beforecut,*beforepaste,*fullscreenchange,*fullscreenerror,*search,*webkitfullscreenchange,*webkitfullscreenerror,outerHTML,%part,#scrollLeft,#scrollTop,slot' +
        /* added manually to avoid breaking changes */
        ',*message,*mozfullscreenchange,*mozfullscreenerror,*mozpointerlockchange,*mozpointerlockerror,*webglcontextcreationerror,*webglcontextlost,*webglcontextrestored',
    '[HTMLElement]^[Element]|accessKey,autocapitalize,!autofocus,contentEditable,dir,!draggable,enterKeyHint,!hidden,!inert,innerText,inputMode,lang,nonce,*abort,*animationend,*animationiteration,*animationstart,*auxclick,*beforexrselect,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*formdata,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*paste,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerrawupdate,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*securitypolicyviolation,*seeked,*seeking,*select,*selectionchange,*selectstart,*slotchange,*stalled,*submit,*suspend,*timeupdate,*toggle,*transitioncancel,*transitionend,*transitionrun,*transitionstart,*volumechange,*waiting,*webkitanimationend,*webkitanimationiteration,*webkitanimationstart,*webkittransitionend,*wheel,outerText,!spellcheck,%style,#tabIndex,title,!translate,virtualKeyboardPolicy',
    'abbr,address,article,aside,b,bdi,bdo,cite,content,code,dd,dfn,dt,em,figcaption,figure,footer,header,hgroup,i,kbd,main,mark,nav,noscript,rb,rp,rt,rtc,ruby,s,samp,section,small,strong,sub,sup,u,var,wbr^[HTMLElement]|accessKey,autocapitalize,!autofocus,contentEditable,dir,!draggable,enterKeyHint,!hidden,innerText,inputMode,lang,nonce,*abort,*animationend,*animationiteration,*animationstart,*auxclick,*beforexrselect,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*formdata,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*paste,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerrawupdate,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*securitypolicyviolation,*seeked,*seeking,*select,*selectionchange,*selectstart,*slotchange,*stalled,*submit,*suspend,*timeupdate,*toggle,*transitioncancel,*transitionend,*transitionrun,*transitionstart,*volumechange,*waiting,*webkitanimationend,*webkitanimationiteration,*webkitanimationstart,*webkittransitionend,*wheel,outerText,!spellcheck,%style,#tabIndex,title,!translate,virtualKeyboardPolicy',
    'media^[HTMLElement]|!autoplay,!controls,%controlsList,%crossOrigin,#currentTime,!defaultMuted,#defaultPlaybackRate,!disableRemotePlayback,!loop,!muted,*encrypted,*waitingforkey,#playbackRate,preload,!preservesPitch,src,%srcObject,#volume',
    ':svg:^[HTMLElement]|!autofocus,nonce,*abort,*animationend,*animationiteration,*animationstart,*auxclick,*beforexrselect,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*formdata,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*paste,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerrawupdate,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*securitypolicyviolation,*seeked,*seeking,*select,*selectionchange,*selectstart,*slotchange,*stalled,*submit,*suspend,*timeupdate,*toggle,*transitioncancel,*transitionend,*transitionrun,*transitionstart,*volumechange,*waiting,*webkitanimationend,*webkitanimationiteration,*webkitanimationstart,*webkittransitionend,*wheel,%style,#tabIndex',
    ':svg:graphics^:svg:|',
    ':svg:animation^:svg:|*begin,*end,*repeat',
    ':svg:geometry^:svg:|',
    ':svg:componentTransferFunction^:svg:|',
    ':svg:gradient^:svg:|',
    ':svg:textContent^:svg:graphics|',
    ':svg:textPositioning^:svg:textContent|',
    'a^[HTMLElement]|charset,coords,download,hash,host,hostname,href,hreflang,name,password,pathname,ping,port,protocol,referrerPolicy,rel,%relList,rev,search,shape,target,text,type,username',
    'area^[HTMLElement]|alt,coords,download,hash,host,hostname,href,!noHref,password,pathname,ping,port,protocol,referrerPolicy,rel,%relList,search,shape,target,username',
    'audio^media|',
    'br^[HTMLElement]|clear',
    'base^[HTMLElement]|href,target',
    'body^[HTMLElement]|aLink,background,bgColor,link,*afterprint,*beforeprint,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*messageerror,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,text,vLink',
    'button^[HTMLElement]|!disabled,formAction,formEnctype,formMethod,!formNoValidate,formTarget,name,type,value',
    'canvas^[HTMLElement]|#height,#width',
    'content^[HTMLElement]|select',
    'dl^[HTMLElement]|!compact',
    'data^[HTMLElement]|value',
    'datalist^[HTMLElement]|',
    'details^[HTMLElement]|!open',
    'dialog^[HTMLElement]|!open,returnValue',
    'dir^[HTMLElement]|!compact',
    'div^[HTMLElement]|align',
    'embed^[HTMLElement]|align,height,name,src,type,width',
    'fieldset^[HTMLElement]|!disabled,name',
    'font^[HTMLElement]|color,face,size',
    'form^[HTMLElement]|acceptCharset,action,autocomplete,encoding,enctype,method,name,!noValidate,target',
    'frame^[HTMLElement]|frameBorder,longDesc,marginHeight,marginWidth,name,!noResize,scrolling,src',
    'frameset^[HTMLElement]|cols,*afterprint,*beforeprint,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*messageerror,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,rows',
    'hr^[HTMLElement]|align,color,!noShade,size,width',
    'head^[HTMLElement]|',
    'h1,h2,h3,h4,h5,h6^[HTMLElement]|align',
    'html^[HTMLElement]|version',
    'iframe^[HTMLElement]|align,allow,!allowFullscreen,!allowPaymentRequest,csp,frameBorder,height,loading,longDesc,marginHeight,marginWidth,name,referrerPolicy,%sandbox,scrolling,src,srcdoc,width',
    'img^[HTMLElement]|align,alt,border,%crossOrigin,decoding,#height,#hspace,!isMap,loading,longDesc,lowsrc,name,referrerPolicy,sizes,src,srcset,useMap,#vspace,#width',
    'input^[HTMLElement]|accept,align,alt,autocomplete,!checked,!defaultChecked,defaultValue,dirName,!disabled,%files,formAction,formEnctype,formMethod,!formNoValidate,formTarget,#height,!incremental,!indeterminate,max,#maxLength,min,#minLength,!multiple,name,pattern,placeholder,!readOnly,!required,selectionDirection,#selectionEnd,#selectionStart,#size,src,step,type,useMap,value,%valueAsDate,#valueAsNumber,#width',
    'li^[HTMLElement]|type,#value',
    'label^[HTMLElement]|htmlFor',
    'legend^[HTMLElement]|align',
    'link^[HTMLElement]|as,charset,%crossOrigin,!disabled,href,hreflang,imageSizes,imageSrcset,integrity,media,referrerPolicy,rel,%relList,rev,%sizes,target,type',
    'map^[HTMLElement]|name',
    'marquee^[HTMLElement]|behavior,bgColor,direction,height,#hspace,#loop,#scrollAmount,#scrollDelay,!trueSpeed,#vspace,width',
    'menu^[HTMLElement]|!compact',
    'meta^[HTMLElement]|content,httpEquiv,media,name,scheme',
    'meter^[HTMLElement]|#high,#low,#max,#min,#optimum,#value',
    'ins,del^[HTMLElement]|cite,dateTime',
    'ol^[HTMLElement]|!compact,!reversed,#start,type',
    'object^[HTMLElement]|align,archive,border,code,codeBase,codeType,data,!declare,height,#hspace,name,standby,type,useMap,#vspace,width',
    'optgroup^[HTMLElement]|!disabled,label',
    'option^[HTMLElement]|!defaultSelected,!disabled,label,!selected,text,value',
    'output^[HTMLElement]|defaultValue,%htmlFor,name,value',
    'p^[HTMLElement]|align',
    'param^[HTMLElement]|name,type,value,valueType',
    'picture^[HTMLElement]|',
    'pre^[HTMLElement]|#width',
    'progress^[HTMLElement]|#max,#value',
    'q,blockquote,cite^[HTMLElement]|',
    'script^[HTMLElement]|!async,charset,%crossOrigin,!defer,event,htmlFor,integrity,!noModule,%referrerPolicy,src,text,type',
    'select^[HTMLElement]|autocomplete,!disabled,#length,!multiple,name,!required,#selectedIndex,#size,value',
    'slot^[HTMLElement]|name',
    'source^[HTMLElement]|#height,media,sizes,src,srcset,type,#width',
    'span^[HTMLElement]|',
    'style^[HTMLElement]|!disabled,media,type',
    'caption^[HTMLElement]|align',
    'th,td^[HTMLElement]|abbr,align,axis,bgColor,ch,chOff,#colSpan,headers,height,!noWrap,#rowSpan,scope,vAlign,width',
    'col,colgroup^[HTMLElement]|align,ch,chOff,#span,vAlign,width',
    'table^[HTMLElement]|align,bgColor,border,%caption,cellPadding,cellSpacing,frame,rules,summary,%tFoot,%tHead,width',
    'tr^[HTMLElement]|align,bgColor,ch,chOff,vAlign',
    'tfoot,thead,tbody^[HTMLElement]|align,ch,chOff,vAlign',
    'template^[HTMLElement]|',
    'textarea^[HTMLElement]|autocomplete,#cols,defaultValue,dirName,!disabled,#maxLength,#minLength,name,placeholder,!readOnly,!required,#rows,selectionDirection,#selectionEnd,#selectionStart,value,wrap',
    'time^[HTMLElement]|dateTime',
    'title^[HTMLElement]|text',
    'track^[HTMLElement]|!default,kind,label,src,srclang',
    'ul^[HTMLElement]|!compact,type',
    'unknown^[HTMLElement]|',
    'video^media|!disablePictureInPicture,#height,*enterpictureinpicture,*leavepictureinpicture,!playsInline,poster,#width',
    ':svg:a^:svg:graphics|',
    ':svg:animate^:svg:animation|',
    ':svg:animateMotion^:svg:animation|',
    ':svg:animateTransform^:svg:animation|',
    ':svg:circle^:svg:geometry|',
    ':svg:clipPath^:svg:graphics|',
    ':svg:defs^:svg:graphics|',
    ':svg:desc^:svg:|',
    ':svg:discard^:svg:|',
    ':svg:ellipse^:svg:geometry|',
    ':svg:feBlend^:svg:|',
    ':svg:feColorMatrix^:svg:|',
    ':svg:feComponentTransfer^:svg:|',
    ':svg:feComposite^:svg:|',
    ':svg:feConvolveMatrix^:svg:|',
    ':svg:feDiffuseLighting^:svg:|',
    ':svg:feDisplacementMap^:svg:|',
    ':svg:feDistantLight^:svg:|',
    ':svg:feDropShadow^:svg:|',
    ':svg:feFlood^:svg:|',
    ':svg:feFuncA^:svg:componentTransferFunction|',
    ':svg:feFuncB^:svg:componentTransferFunction|',
    ':svg:feFuncG^:svg:componentTransferFunction|',
    ':svg:feFuncR^:svg:componentTransferFunction|',
    ':svg:feGaussianBlur^:svg:|',
    ':svg:feImage^:svg:|',
    ':svg:feMerge^:svg:|',
    ':svg:feMergeNode^:svg:|',
    ':svg:feMorphology^:svg:|',
    ':svg:feOffset^:svg:|',
    ':svg:fePointLight^:svg:|',
    ':svg:feSpecularLighting^:svg:|',
    ':svg:feSpotLight^:svg:|',
    ':svg:feTile^:svg:|',
    ':svg:feTurbulence^:svg:|',
    ':svg:filter^:svg:|',
    ':svg:foreignObject^:svg:graphics|',
    ':svg:g^:svg:graphics|',
    ':svg:image^:svg:graphics|decoding',
    ':svg:line^:svg:geometry|',
    ':svg:linearGradient^:svg:gradient|',
    ':svg:mpath^:svg:|',
    ':svg:marker^:svg:|',
    ':svg:mask^:svg:|',
    ':svg:metadata^:svg:|',
    ':svg:path^:svg:geometry|',
    ':svg:pattern^:svg:|',
    ':svg:polygon^:svg:geometry|',
    ':svg:polyline^:svg:geometry|',
    ':svg:radialGradient^:svg:gradient|',
    ':svg:rect^:svg:geometry|',
    ':svg:svg^:svg:graphics|#currentScale,#zoomAndPan',
    ':svg:script^:svg:|type',
    ':svg:set^:svg:animation|',
    ':svg:stop^:svg:|',
    ':svg:style^:svg:|!disabled,media,title,type',
    ':svg:switch^:svg:graphics|',
    ':svg:symbol^:svg:|',
    ':svg:tspan^:svg:textPositioning|',
    ':svg:text^:svg:textPositioning|',
    ':svg:textPath^:svg:textContent|',
    ':svg:title^:svg:|',
    ':svg:use^:svg:graphics|',
    ':svg:view^:svg:|#zoomAndPan',
    'data^[HTMLElement]|value',
    'keygen^[HTMLElement]|!autofocus,challenge,!disabled,form,keytype,name',
    'menuitem^[HTMLElement]|type,label,icon,!disabled,!checked,radiogroup,!default',
    'summary^[HTMLElement]|',
    'time^[HTMLElement]|dateTime',
    ':svg:cursor^:svg:|',
];
const _ATTR_TO_PROP = new Map(Object.entries({
    'class': 'className',
    'for': 'htmlFor',
    'formaction': 'formAction',
    'innerHtml': 'innerHTML',
    'readonly': 'readOnly',
    'tabindex': 'tabIndex',
}));
// Invert _ATTR_TO_PROP.
const _PROP_TO_ATTR = Array.from(_ATTR_TO_PROP).reduce((inverted, [propertyName, attributeName]) => {
    inverted.set(propertyName, attributeName);
    return inverted;
}, new Map());
export class DomElementSchemaRegistry extends ElementSchemaRegistry {
    constructor() {
        super();
        this._schema = new Map();
        // We don't allow binding to events for security reasons. Allowing event bindings would almost
        // certainly introduce bad XSS vulnerabilities. Instead, we store events in a separate schema.
        this._eventSchema = new Map;
        SCHEMA.forEach(encodedType => {
            const type = new Map();
            const events = new Set();
            const [strType, strProperties] = encodedType.split('|');
            const properties = strProperties.split(',');
            const [typeNames, superName] = strType.split('^');
            typeNames.split(',').forEach(tag => {
                this._schema.set(tag.toLowerCase(), type);
                this._eventSchema.set(tag.toLowerCase(), events);
            });
            const superType = superName && this._schema.get(superName.toLowerCase());
            if (superType) {
                for (const [prop, value] of superType) {
                    type.set(prop, value);
                }
                for (const superEvent of this._eventSchema.get(superName.toLowerCase())) {
                    events.add(superEvent);
                }
            }
            properties.forEach((property) => {
                if (property.length > 0) {
                    switch (property[0]) {
                        case '*':
                            events.add(property.substring(1));
                            break;
                        case '!':
                            type.set(property.substring(1), BOOLEAN);
                            break;
                        case '#':
                            type.set(property.substring(1), NUMBER);
                            break;
                        case '%':
                            type.set(property.substring(1), OBJECT);
                            break;
                        default:
                            type.set(property, STRING);
                    }
                }
            });
        });
    }
    hasProperty(tagName, propName, schemaMetas) {
        if (schemaMetas.some((schema) => schema.name === NO_ERRORS_SCHEMA.name)) {
            return true;
        }
        if (tagName.indexOf('-') > -1) {
            if (isNgContainer(tagName) || isNgContent(tagName)) {
                return false;
            }
            if (schemaMetas.some((schema) => schema.name === CUSTOM_ELEMENTS_SCHEMA.name)) {
                // Can't tell now as we don't know which properties a custom element will get
                // once it is instantiated
                return true;
            }
        }
        const elementProperties = this._schema.get(tagName.toLowerCase()) || this._schema.get('unknown');
        return elementProperties.has(propName);
    }
    hasElement(tagName, schemaMetas) {
        if (schemaMetas.some((schema) => schema.name === NO_ERRORS_SCHEMA.name)) {
            return true;
        }
        if (tagName.indexOf('-') > -1) {
            if (isNgContainer(tagName) || isNgContent(tagName)) {
                return true;
            }
            if (schemaMetas.some((schema) => schema.name === CUSTOM_ELEMENTS_SCHEMA.name)) {
                // Allow any custom elements
                return true;
            }
        }
        return this._schema.has(tagName.toLowerCase());
    }
    /**
     * securityContext returns the security context for the given property on the given DOM tag.
     *
     * Tag and property name are statically known and cannot change at runtime, i.e. it is not
     * possible to bind a value into a changing attribute or tag name.
     *
     * The filtering is based on a list of allowed tags|attributes. All attributes in the schema
     * above are assumed to have the 'NONE' security context, i.e. that they are safe inert
     * string values. Only specific well known attack vectors are assigned their appropriate context.
     */
    securityContext(tagName, propName, isAttribute) {
        if (isAttribute) {
            // NB: For security purposes, use the mapped property name, not the attribute name.
            propName = this.getMappedPropName(propName);
        }
        // Make sure comparisons are case insensitive, so that case differences between attribute and
        // property names do not have a security impact.
        tagName = tagName.toLowerCase();
        propName = propName.toLowerCase();
        let ctx = SECURITY_SCHEMA()[tagName + '|' + propName];
        if (ctx) {
            return ctx;
        }
        ctx = SECURITY_SCHEMA()['*|' + propName];
        return ctx ? ctx : SecurityContext.NONE;
    }
    getMappedPropName(propName) {
        return _ATTR_TO_PROP.get(propName) ?? propName;
    }
    getDefaultComponentElementName() {
        return 'ng-component';
    }
    validateProperty(name) {
        if (name.toLowerCase().startsWith('on')) {
            const msg = `Binding to event property '${name}' is disallowed for security reasons, ` +
                `please use (${name.slice(2)})=...` +
                `\nIf '${name}' is a directive input, make sure the directive is imported by the` +
                ` current module.`;
            return { error: true, msg: msg };
        }
        else {
            return { error: false };
        }
    }
    validateAttribute(name) {
        if (name.toLowerCase().startsWith('on')) {
            const msg = `Binding to event attribute '${name}' is disallowed for security reasons, ` +
                `please use (${name.slice(2)})=...`;
            return { error: true, msg: msg };
        }
        else {
            return { error: false };
        }
    }
    allKnownElementNames() {
        return Array.from(this._schema.keys());
    }
    allKnownAttributesOfElement(tagName) {
        const elementProperties = this._schema.get(tagName.toLowerCase()) || this._schema.get('unknown');
        // Convert properties to attributes.
        return Array.from(elementProperties.keys()).map(prop => _PROP_TO_ATTR.get(prop) ?? prop);
    }
    allKnownEventsOfElement(tagName) {
        return Array.from(this._eventSchema.get(tagName.toLowerCase()) ?? []);
    }
    normalizeAnimationStyleProperty(propName) {
        return dashCaseToCamelCase(propName);
    }
    normalizeAnimationStyleValue(camelCaseProp, userProvidedProp, val) {
        let unit = '';
        const strVal = val.toString().trim();
        let errorMsg = null;
        if (_isPixelDimensionStyle(camelCaseProp) && val !== 0 && val !== '0') {
            if (typeof val === 'number') {
                unit = 'px';
            }
            else {
                const valAndSuffixMatch = val.match(/^[+-]?[\d\.]+([a-z]*)$/);
                if (valAndSuffixMatch && valAndSuffixMatch[1].length == 0) {
                    errorMsg = `Please provide a CSS unit value for ${userProvidedProp}:${val}`;
                }
            }
        }
        return { error: errorMsg, value: strVal + unit };
    }
}
function _isPixelDimensionStyle(prop) {
    switch (prop) {
        case 'width':
        case 'height':
        case 'minWidth':
        case 'minHeight':
        case 'maxWidth':
        case 'maxHeight':
        case 'left':
        case 'top':
        case 'bottom':
        case 'right':
        case 'fontSize':
        case 'outlineWidth':
        case 'outlineOffset':
        case 'paddingTop':
        case 'paddingLeft':
        case 'paddingBottom':
        case 'paddingRight':
        case 'marginTop':
        case 'marginLeft':
        case 'marginBottom':
        case 'marginRight':
        case 'borderRadius':
        case 'borderWidth':
        case 'borderTopWidth':
        case 'borderLeftWidth':
        case 'borderRightWidth':
        case 'borderBottomWidth':
        case 'textIndent':
            return true;
        default:
            return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3NjaGVtYS9kb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLHNCQUFzQixFQUFFLGdCQUFnQixFQUFrQixlQUFlLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDbEcsT0FBTyxFQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFNUMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3RELE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBRWhFLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQztBQUMxQixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDeEIsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQ3hCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUV4Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5Q0c7QUFFSCxvR0FBb0c7QUFDcEcsb0dBQW9HO0FBQ3BHLG9HQUFvRztBQUNwRyxvR0FBb0c7QUFDcEcsb0dBQW9HO0FBQ3BHLEVBQUU7QUFDRiwrRUFBK0U7QUFDL0UsRUFBRTtBQUNGLGtHQUFrRztBQUNsRyxxRUFBcUU7QUFDckUsRUFBRTtBQUNGLG9HQUFvRztBQUVwRyxNQUFNLE1BQU0sR0FBYTtJQUN2Qix1d0JBQXV3QjtRQUNud0IsOENBQThDO1FBQzlDLGtLQUFrSztJQUN0Syx1dkNBQXV2QztJQUN2dkMsODZDQUE4NkM7SUFDOTZDLCtPQUErTztJQUMvTyx5a0NBQXlrQztJQUN6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QUFRLElBQUksRUFBRSxDQUFDO1FBQ2IsS0FBSyxPQUFPLENBQUM7UUFDYixLQUFLLFFBQVEsQ0FBQztRQUNkLEtBQUssVUFBVSxDQUFDO1FBQ2hCLEtBQUssV0FBVyxDQUFDO1FBQ2pCLEtBQUssVUFBVSxDQUFDO1FBQ2hCLEtBQUssV0FBVyxDQUFDO1FBQ2pCLEtBQUssTUFBTSxDQUFDO1FBQ1osS0FBSyxLQUFLLENBQUM7UUFDWCxLQUFLLFFBQVEsQ0FBQztRQUNkLEtBQUssT0FBTyxDQUFDO1FBQ2IsS0FBSyxVQUFVLENBQUM7UUFDaEIsS0FBSyxjQUFjLENBQUM7UUFDcEIsS0FBSyxlQUFlLENBQUM7UUFDckIsS0FBSyxZQUFZLENBQUM7UUFDbEIsS0FBSyxhQUFhLENBQUM7UUFDbkIsS0FBSyxlQUFlLENBQUM7UUFDckIsS0FBSyxjQUFjLENBQUM7UUFDcEIsS0FBSyxXQUFXLENBQUM7UUFDakIsS0FBSyxZQUFZLENBQUM7UUFDbEIsS0FBSyxjQUFjLENBQUM7UUFDcEIsS0FBSyxhQUFhLENBQUM7UUFDbkIsS0FBSyxjQUFjLENBQUM7UUFDcEIsS0FBSyxhQUFhLENBQUM7UUFDbkIsS0FBSyxnQkFBZ0IsQ0FBQztRQUN0QixLQUFLLGlCQUFpQixDQUFDO1FBQ3ZCLEtBQUssa0JBQWtCLENBQUM7UUFDeEIsS0FBSyxtQkFBbUIsQ0FBQztRQUN6QixLQUFLLFlBQVk7WUFDZixPQUFPLElBQUksQ0FBQztRQUVkO1lBQ0UsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDVVNUT01fRUxFTUVOVFNfU0NIRU1BLCBOT19FUlJPUlNfU0NIRU1BLCBTY2hlbWFNZXRhZGF0YSwgU2VjdXJpdHlDb250ZXh0fSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCB7aXNOZ0NvbnRhaW5lciwgaXNOZ0NvbnRlbnR9IGZyb20gJy4uL21sX3BhcnNlci90YWdzJztcbmltcG9ydCB7ZGFzaENhc2VUb0NhbWVsQ2FzZX0gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7U0VDVVJJVFlfU0NIRU1BfSBmcm9tICcuL2RvbV9zZWN1cml0eV9zY2hlbWEnO1xuaW1wb3J0IHtFbGVtZW50U2NoZW1hUmVnaXN0cnl9IGZyb20gJy4vZWxlbWVudF9zY2hlbWFfcmVnaXN0cnknO1xuXG5jb25zdCBCT09MRUFOID0gJ2Jvb2xlYW4nO1xuY29uc3QgTlVNQkVSID0gJ251bWJlcic7XG5jb25zdCBTVFJJTkcgPSAnc3RyaW5nJztcbmNvbnN0IE9CSkVDVCA9ICdvYmplY3QnO1xuXG4vKipcbiAqIFRoaXMgYXJyYXkgcmVwcmVzZW50cyB0aGUgRE9NIHNjaGVtYS4gSXQgZW5jb2RlcyBpbmhlcml0YW5jZSwgcHJvcGVydGllcywgYW5kIGV2ZW50cy5cbiAqXG4gKiAjIyBPdmVydmlld1xuICpcbiAqIEVhY2ggbGluZSByZXByZXNlbnRzIG9uZSBraW5kIG9mIGVsZW1lbnQuIFRoZSBgZWxlbWVudF9pbmhlcml0YW5jZWAgYW5kIHByb3BlcnRpZXMgYXJlIGpvaW5lZFxuICogdXNpbmcgYGVsZW1lbnRfaW5oZXJpdGFuY2V8cHJvcGVydGllc2Agc3ludGF4LlxuICpcbiAqICMjIEVsZW1lbnQgSW5oZXJpdGFuY2VcbiAqXG4gKiBUaGUgYGVsZW1lbnRfaW5oZXJpdGFuY2VgIGNhbiBiZSBmdXJ0aGVyIHN1YmRpdmlkZWQgYXMgYGVsZW1lbnQxLGVsZW1lbnQyLC4uLl5wYXJlbnRFbGVtZW50YC5cbiAqIEhlcmUgdGhlIGluZGl2aWR1YWwgZWxlbWVudHMgYXJlIHNlcGFyYXRlZCBieSBgLGAgKGNvbW1hcykuIEV2ZXJ5IGVsZW1lbnQgaW4gdGhlIGxpc3RcbiAqIGhhcyBpZGVudGljYWwgcHJvcGVydGllcy5cbiAqXG4gKiBBbiBgZWxlbWVudGAgbWF5IGluaGVyaXQgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIGZyb20gYHBhcmVudEVsZW1lbnRgIElmIG5vIGBecGFyZW50RWxlbWVudGAgaXNcbiAqIHNwZWNpZmllZCB0aGVuIGBcIlwiYCAoYmxhbmspIGVsZW1lbnQgaXMgYXNzdW1lZC5cbiAqXG4gKiBOT1RFOiBUaGUgYmxhbmsgZWxlbWVudCBpbmhlcml0cyBmcm9tIHJvb3QgYFtFbGVtZW50XWAgZWxlbWVudCwgdGhlIHN1cGVyIGVsZW1lbnQgb2YgYWxsXG4gKiBlbGVtZW50cy5cbiAqXG4gKiBOT1RFIGFuIGVsZW1lbnQgcHJlZml4IHN1Y2ggYXMgYDpzdmc6YCBoYXMgbm8gc3BlY2lhbCBtZWFuaW5nIHRvIHRoZSBzY2hlbWEuXG4gKlxuICogIyMgUHJvcGVydGllc1xuICpcbiAqIEVhY2ggZWxlbWVudCBoYXMgYSBzZXQgb2YgcHJvcGVydGllcyBzZXBhcmF0ZWQgYnkgYCxgIChjb21tYXMpLiBFYWNoIHByb3BlcnR5IGNhbiBiZSBwcmVmaXhlZFxuICogYnkgYSBzcGVjaWFsIGNoYXJhY3RlciBkZXNpZ25hdGluZyBpdHMgdHlwZTpcbiAqXG4gKiAtIChubyBwcmVmaXgpOiBwcm9wZXJ0eSBpcyBhIHN0cmluZy5cbiAqIC0gYCpgOiBwcm9wZXJ0eSByZXByZXNlbnRzIGFuIGV2ZW50LlxuICogLSBgIWA6IHByb3BlcnR5IGlzIGEgYm9vbGVhbi5cbiAqIC0gYCNgOiBwcm9wZXJ0eSBpcyBhIG51bWJlci5cbiAqIC0gYCVgOiBwcm9wZXJ0eSBpcyBhbiBvYmplY3QuXG4gKlxuICogIyMgUXVlcnlcbiAqXG4gKiBUaGUgY2xhc3MgY3JlYXRlcyBhbiBpbnRlcm5hbCBzcXVhcyByZXByZXNlbnRhdGlvbiB3aGljaCBhbGxvd3MgdG8gZWFzaWx5IGFuc3dlciB0aGUgcXVlcnkgb2ZcbiAqIGlmIGEgZ2l2ZW4gcHJvcGVydHkgZXhpc3Qgb24gYSBnaXZlbiBlbGVtZW50LlxuICpcbiAqIE5PVEU6IFdlIGRvbid0IHlldCBzdXBwb3J0IHF1ZXJ5aW5nIGZvciB0eXBlcyBvciBldmVudHMuXG4gKiBOT1RFOiBUaGlzIHNjaGVtYSBpcyBhdXRvIGV4dHJhY3RlZCBmcm9tIGBzY2hlbWFfZXh0cmFjdG9yLnRzYCBsb2NhdGVkIGluIHRoZSB0ZXN0IGZvbGRlcixcbiAqICAgICAgIHNlZSBkb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnlfc3BlYy50c1xuICovXG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vID09PT09PT09PT09IFMgVCBPIFAgICAtICBTIFQgTyBQICAgLSAgUyBUIE8gUCAgIC0gIFMgVCBPIFAgICAtICBTIFQgTyBQICAgLSAgUyBUIE8gUCAgPT09PT09PT09PT1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vXG4vLyAgICAgICAgICAgICAgICAgICAgICAgRE8gTk9UIEVESVQgVEhJUyBET00gU0NIRU1BIFdJVEhPVVQgQSBTRUNVUklUWSBSRVZJRVchXG4vL1xuLy8gTmV3bHkgYWRkZWQgcHJvcGVydGllcyBtdXN0IGJlIHNlY3VyaXR5IHJldmlld2VkIGFuZCBhc3NpZ25lZCBhbiBhcHByb3ByaWF0ZSBTZWN1cml0eUNvbnRleHQgaW5cbi8vIGRvbV9zZWN1cml0eV9zY2hlbWEudHMuIFJlYWNoIG91dCB0byBtcHJvYnN0ICYgcmphbWV0IGZvciBkZXRhaWxzLlxuLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuY29uc3QgU0NIRU1BOiBzdHJpbmdbXSA9IFtcbiAgJ1tFbGVtZW50XXx0ZXh0Q29udGVudCwlYXJpYUF0b21pYywlYXJpYUF1dG9Db21wbGV0ZSwlYXJpYUJ1c3ksJWFyaWFDaGVja2VkLCVhcmlhQ29sQ291bnQsJWFyaWFDb2xJbmRleCwlYXJpYUNvbFNwYW4sJWFyaWFDdXJyZW50LCVhcmlhRGVzY3JpcHRpb24sJWFyaWFEaXNhYmxlZCwlYXJpYUV4cGFuZGVkLCVhcmlhSGFzUG9wdXAsJWFyaWFIaWRkZW4sJWFyaWFLZXlTaG9ydGN1dHMsJWFyaWFMYWJlbCwlYXJpYUxldmVsLCVhcmlhTGl2ZSwlYXJpYU1vZGFsLCVhcmlhTXVsdGlMaW5lLCVhcmlhTXVsdGlTZWxlY3RhYmxlLCVhcmlhT3JpZW50YXRpb24sJWFyaWFQbGFjZWhvbGRlciwlYXJpYVBvc0luU2V0LCVhcmlhUHJlc3NlZCwlYXJpYVJlYWRPbmx5LCVhcmlhUmVsZXZhbnQsJWFyaWFSZXF1aXJlZCwlYXJpYVJvbGVEZXNjcmlwdGlvbiwlYXJpYVJvd0NvdW50LCVhcmlhUm93SW5kZXgsJWFyaWFSb3dTcGFuLCVhcmlhU2VsZWN0ZWQsJWFyaWFTZXRTaXplLCVhcmlhU29ydCwlYXJpYVZhbHVlTWF4LCVhcmlhVmFsdWVNaW4sJWFyaWFWYWx1ZU5vdywlYXJpYVZhbHVlVGV4dCwlY2xhc3NMaXN0LGNsYXNzTmFtZSxlbGVtZW50VGltaW5nLGlkLGlubmVySFRNTCwqYmVmb3JlY29weSwqYmVmb3JlY3V0LCpiZWZvcmVwYXN0ZSwqZnVsbHNjcmVlbmNoYW5nZSwqZnVsbHNjcmVlbmVycm9yLCpzZWFyY2gsKndlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UsKndlYmtpdGZ1bGxzY3JlZW5lcnJvcixvdXRlckhUTUwsJXBhcnQsI3Njcm9sbExlZnQsI3Njcm9sbFRvcCxzbG90JyArXG4gICAgICAvKiBhZGRlZCBtYW51YWxseSB0byBhdm9pZCBicmVha2luZyBjaGFuZ2VzICovXG4gICAgICAnLCptZXNzYWdlLCptb3pmdWxsc2NyZWVuY2hhbmdlLCptb3pmdWxsc2NyZWVuZXJyb3IsKm1venBvaW50ZXJsb2NrY2hhbmdlLCptb3pwb2ludGVybG9ja2Vycm9yLCp3ZWJnbGNvbnRleHRjcmVhdGlvbmVycm9yLCp3ZWJnbGNvbnRleHRsb3N0LCp3ZWJnbGNvbnRleHRyZXN0b3JlZCcsXG4gICdbSFRNTEVsZW1lbnRdXltFbGVtZW50XXxhY2Nlc3NLZXksYXV0b2NhcGl0YWxpemUsIWF1dG9mb2N1cyxjb250ZW50RWRpdGFibGUsZGlyLCFkcmFnZ2FibGUsZW50ZXJLZXlIaW50LCFoaWRkZW4sIWluZXJ0LGlubmVyVGV4dCxpbnB1dE1vZGUsbGFuZyxub25jZSwqYWJvcnQsKmFuaW1hdGlvbmVuZCwqYW5pbWF0aW9uaXRlcmF0aW9uLCphbmltYXRpb25zdGFydCwqYXV4Y2xpY2ssKmJlZm9yZXhyc2VsZWN0LCpibHVyLCpjYW5jZWwsKmNhbnBsYXksKmNhbnBsYXl0aHJvdWdoLCpjaGFuZ2UsKmNsaWNrLCpjbG9zZSwqY29udGV4dG1lbnUsKmNvcHksKmN1ZWNoYW5nZSwqY3V0LCpkYmxjbGljaywqZHJhZywqZHJhZ2VuZCwqZHJhZ2VudGVyLCpkcmFnbGVhdmUsKmRyYWdvdmVyLCpkcmFnc3RhcnQsKmRyb3AsKmR1cmF0aW9uY2hhbmdlLCplbXB0aWVkLCplbmRlZCwqZXJyb3IsKmZvY3VzLCpmb3JtZGF0YSwqZ290cG9pbnRlcmNhcHR1cmUsKmlucHV0LCppbnZhbGlkLCprZXlkb3duLCprZXlwcmVzcywqa2V5dXAsKmxvYWQsKmxvYWRlZGRhdGEsKmxvYWRlZG1ldGFkYXRhLCpsb2Fkc3RhcnQsKmxvc3Rwb2ludGVyY2FwdHVyZSwqbW91c2Vkb3duLCptb3VzZWVudGVyLCptb3VzZWxlYXZlLCptb3VzZW1vdmUsKm1vdXNlb3V0LCptb3VzZW92ZXIsKm1vdXNldXAsKm1vdXNld2hlZWwsKnBhc3RlLCpwYXVzZSwqcGxheSwqcGxheWluZywqcG9pbnRlcmNhbmNlbCwqcG9pbnRlcmRvd24sKnBvaW50ZXJlbnRlciwqcG9pbnRlcmxlYXZlLCpwb2ludGVybW92ZSwqcG9pbnRlcm91dCwqcG9pbnRlcm92ZXIsKnBvaW50ZXJyYXd1cGRhdGUsKnBvaW50ZXJ1cCwqcHJvZ3Jlc3MsKnJhdGVjaGFuZ2UsKnJlc2V0LCpyZXNpemUsKnNjcm9sbCwqc2VjdXJpdHlwb2xpY3l2aW9sYXRpb24sKnNlZWtlZCwqc2Vla2luZywqc2VsZWN0LCpzZWxlY3Rpb25jaGFuZ2UsKnNlbGVjdHN0YXJ0LCpzbG90Y2hhbmdlLCpzdGFsbGVkLCpzdWJtaXQsKnN1c3BlbmQsKnRpbWV1cGRhdGUsKnRvZ2dsZSwqdHJhbnNpdGlvbmNhbmNlbCwqdHJhbnNpdGlvbmVuZCwqdHJhbnNpdGlvbnJ1biwqdHJhbnNpdGlvbnN0YXJ0LCp2b2x1bWVjaGFuZ2UsKndhaXRpbmcsKndlYmtpdGFuaW1hdGlvbmVuZCwqd2Via2l0YW5pbWF0aW9uaXRlcmF0aW9uLCp3ZWJraXRhbmltYXRpb25zdGFydCwqd2Via2l0dHJhbnNpdGlvbmVuZCwqd2hlZWwsb3V0ZXJUZXh0LCFzcGVsbGNoZWNrLCVzdHlsZSwjdGFiSW5kZXgsdGl0bGUsIXRyYW5zbGF0ZSx2aXJ0dWFsS2V5Ym9hcmRQb2xpY3knLFxuICAnYWJicixhZGRyZXNzLGFydGljbGUsYXNpZGUsYixiZGksYmRvLGNpdGUsY29udGVudCxjb2RlLGRkLGRmbixkdCxlbSxmaWdjYXB0aW9uLGZpZ3VyZSxmb290ZXIsaGVhZGVyLGhncm91cCxpLGtiZCxtYWluLG1hcmssbmF2LG5vc2NyaXB0LHJiLHJwLHJ0LHJ0YyxydWJ5LHMsc2FtcCxzZWN0aW9uLHNtYWxsLHN0cm9uZyxzdWIsc3VwLHUsdmFyLHdicl5bSFRNTEVsZW1lbnRdfGFjY2Vzc0tleSxhdXRvY2FwaXRhbGl6ZSwhYXV0b2ZvY3VzLGNvbnRlbnRFZGl0YWJsZSxkaXIsIWRyYWdnYWJsZSxlbnRlcktleUhpbnQsIWhpZGRlbixpbm5lclRleHQsaW5wdXRNb2RlLGxhbmcsbm9uY2UsKmFib3J0LCphbmltYXRpb25lbmQsKmFuaW1hdGlvbml0ZXJhdGlvbiwqYW5pbWF0aW9uc3RhcnQsKmF1eGNsaWNrLCpiZWZvcmV4cnNlbGVjdCwqYmx1ciwqY2FuY2VsLCpjYW5wbGF5LCpjYW5wbGF5dGhyb3VnaCwqY2hhbmdlLCpjbGljaywqY2xvc2UsKmNvbnRleHRtZW51LCpjb3B5LCpjdWVjaGFuZ2UsKmN1dCwqZGJsY2xpY2ssKmRyYWcsKmRyYWdlbmQsKmRyYWdlbnRlciwqZHJhZ2xlYXZlLCpkcmFnb3ZlciwqZHJhZ3N0YXJ0LCpkcm9wLCpkdXJhdGlvbmNoYW5nZSwqZW1wdGllZCwqZW5kZWQsKmVycm9yLCpmb2N1cywqZm9ybWRhdGEsKmdvdHBvaW50ZXJjYXB0dXJlLCppbnB1dCwqaW52YWxpZCwqa2V5ZG93biwqa2V5cHJlc3MsKmtleXVwLCpsb2FkLCpsb2FkZWRkYXRhLCpsb2FkZWRtZXRhZGF0YSwqbG9hZHN0YXJ0LCpsb3N0cG9pbnRlcmNhcHR1cmUsKm1vdXNlZG93biwqbW91c2VlbnRlciwqbW91c2VsZWF2ZSwqbW91c2Vtb3ZlLCptb3VzZW91dCwqbW91c2VvdmVyLCptb3VzZXVwLCptb3VzZXdoZWVsLCpwYXN0ZSwqcGF1c2UsKnBsYXksKnBsYXlpbmcsKnBvaW50ZXJjYW5jZWwsKnBvaW50ZXJkb3duLCpwb2ludGVyZW50ZXIsKnBvaW50ZXJsZWF2ZSwqcG9pbnRlcm1vdmUsKnBvaW50ZXJvdXQsKnBvaW50ZXJvdmVyLCpwb2ludGVycmF3dXBkYXRlLCpwb2ludGVydXAsKnByb2dyZXNzLCpyYXRlY2hhbmdlLCpyZXNldCwqcmVzaXplLCpzY3JvbGwsKnNlY3VyaXR5cG9saWN5dmlvbGF0aW9uLCpzZWVrZWQsKnNlZWtpbmcsKnNlbGVjdCwqc2VsZWN0aW9uY2hhbmdlLCpzZWxlY3RzdGFydCwqc2xvdGNoYW5nZSwqc3RhbGxlZCwqc3VibWl0LCpzdXNwZW5kLCp0aW1ldXBkYXRlLCp0b2dnbGUsKnRyYW5zaXRpb25jYW5jZWwsKnRyYW5zaXRpb25lbmQsKnRyYW5zaXRpb25ydW4sKnRyYW5zaXRpb25zdGFydCwqdm9sdW1lY2hhbmdlLCp3YWl0aW5nLCp3ZWJraXRhbmltYXRpb25lbmQsKndlYmtpdGFuaW1hdGlvbml0ZXJhdGlvbiwqd2Via2l0YW5pbWF0aW9uc3RhcnQsKndlYmtpdHRyYW5zaXRpb25lbmQsKndoZWVsLG91dGVyVGV4dCwhc3BlbGxjaGVjaywlc3R5bGUsI3RhYkluZGV4LHRpdGxlLCF0cmFuc2xhdGUsdmlydHVhbEtleWJvYXJkUG9saWN5JyxcbiAgJ21lZGlhXltIVE1MRWxlbWVudF18IWF1dG9wbGF5LCFjb250cm9scywlY29udHJvbHNMaXN0LCVjcm9zc09yaWdpbiwjY3VycmVudFRpbWUsIWRlZmF1bHRNdXRlZCwjZGVmYXVsdFBsYXliYWNrUmF0ZSwhZGlzYWJsZVJlbW90ZVBsYXliYWNrLCFsb29wLCFtdXRlZCwqZW5jcnlwdGVkLCp3YWl0aW5nZm9ya2V5LCNwbGF5YmFja1JhdGUscHJlbG9hZCwhcHJlc2VydmVzUGl0Y2gsc3JjLCVzcmNPYmplY3QsI3ZvbHVtZScsXG4gICc6c3ZnOl5bSFRNTEVsZW1lbnRdfCFhdXRvZm9jdXMsbm9uY2UsKmFib3J0LCphbmltYXRpb25lbmQsKmFuaW1hdGlvbml0ZXJhdGlvbiwqYW5pbWF0aW9uc3RhcnQsKmF1eGNsaWNrLCpiZWZvcmV4cnNlbGVjdCwqYmx1ciwqY2FuY2VsLCpjYW5wbGF5LCpjYW5wbGF5dGhyb3VnaCwqY2hhbmdlLCpjbGljaywqY2xvc2UsKmNvbnRleHRtZW51LCpjb3B5LCpjdWVjaGFuZ2UsKmN1dCwqZGJsY2xpY2ssKmRyYWcsKmRyYWdlbmQsKmRyYWdlbnRlciwqZHJhZ2xlYXZlLCpkcmFnb3ZlciwqZHJhZ3N0YXJ0LCpkcm9wLCpkdXJhdGlvbmNoYW5nZSwqZW1wdGllZCwqZW5kZWQsKmVycm9yLCpmb2N1cywqZm9ybWRhdGEsKmdvdHBvaW50ZXJjYXB0dXJlLCppbnB1dCwqaW52YWxpZCwqa2V5ZG93biwqa2V5cHJlc3MsKmtleXVwLCpsb2FkLCpsb2FkZWRkYXRhLCpsb2FkZWRtZXRhZGF0YSwqbG9hZHN0YXJ0LCpsb3N0cG9pbnRlcmNhcHR1cmUsKm1vdXNlZG93biwqbW91c2VlbnRlciwqbW91c2VsZWF2ZSwqbW91c2Vtb3ZlLCptb3VzZW91dCwqbW91c2VvdmVyLCptb3VzZXVwLCptb3VzZXdoZWVsLCpwYXN0ZSwqcGF1c2UsKnBsYXksKnBsYXlpbmcsKnBvaW50ZXJjYW5jZWwsKnBvaW50ZXJkb3duLCpwb2ludGVyZW50ZXIsKnBvaW50ZXJsZWF2ZSwqcG9pbnRlcm1vdmUsKnBvaW50ZXJvdXQsKnBvaW50ZXJvdmVyLCpwb2ludGVycmF3dXBkYXRlLCpwb2ludGVydXAsKnByb2dyZXNzLCpyYXRlY2hhbmdlLCpyZXNldCwqcmVzaXplLCpzY3JvbGwsKnNlY3VyaXR5cG9saWN5dmlvbGF0aW9uLCpzZWVrZWQsKnNlZWtpbmcsKnNlbGVjdCwqc2VsZWN0aW9uY2hhbmdlLCpzZWxlY3RzdGFydCwqc2xvdGNoYW5nZSwqc3RhbGxlZCwqc3VibWl0LCpzdXNwZW5kLCp0aW1ldXBkYXRlLCp0b2dnbGUsKnRyYW5zaXRpb25jYW5jZWwsKnRyYW5zaXRpb25lbmQsKnRyYW5zaXRpb25ydW4sKnRyYW5zaXRpb25zdGFydCwqdm9sdW1lY2hhbmdlLCp3YWl0aW5nLCp3ZWJraXRhbmltYXRpb25lbmQsKndlYmtpdGFuaW1hdGlvbml0ZXJhdGlvbiwqd2Via2l0YW5pbWF0aW9uc3RhcnQsKndlYmtpdHRyYW5zaXRpb25lbmQsKndoZWVsLCVzdHlsZSwjdGFiSW5kZXgnLFxuICAnOnN2ZzpncmFwaGljc146c3ZnOnwnLFxuICAnOnN2ZzphbmltYXRpb25eOnN2Zzp8KmJlZ2luLCplbmQsKnJlcGVhdCcsXG4gICc6c3ZnOmdlb21ldHJ5Xjpzdmc6fCcsXG4gICc6c3ZnOmNvbXBvbmVudFRyYW5zZmVyRnVuY3Rpb25eOnN2Zzp8JyxcbiAgJzpzdmc6Z3JhZGllbnReOnN2Zzp8JyxcbiAgJzpzdmc6dGV4dENvbnRlbnReOnN2ZzpncmFwaGljc3wnLFxuICAnOnN2Zzp0ZXh0UG9zaXRpb25pbmdeOnN2Zzp0ZXh0Q29udGVudHwnLFxuICAnYV5bSFRNTEVsZW1lbnRdfGNoYXJzZXQsY29vcmRzLGRvd25sb2FkLGhhc2gsaG9zdCxob3N0bmFtZSxocmVmLGhyZWZsYW5nLG5hbWUscGFzc3dvcmQscGF0aG5hbWUscGluZyxwb3J0LHByb3RvY29sLHJlZmVycmVyUG9saWN5LHJlbCwlcmVsTGlzdCxyZXYsc2VhcmNoLHNoYXBlLHRhcmdldCx0ZXh0LHR5cGUsdXNlcm5hbWUnLFxuICAnYXJlYV5bSFRNTEVsZW1lbnRdfGFsdCxjb29yZHMsZG93bmxvYWQsaGFzaCxob3N0LGhvc3RuYW1lLGhyZWYsIW5vSHJlZixwYXNzd29yZCxwYXRobmFtZSxwaW5nLHBvcnQscHJvdG9jb2wscmVmZXJyZXJQb2xpY3kscmVsLCVyZWxMaXN0LHNlYXJjaCxzaGFwZSx0YXJnZXQsdXNlcm5hbWUnLFxuICAnYXVkaW9ebWVkaWF8JyxcbiAgJ2JyXltIVE1MRWxlbWVudF18Y2xlYXInLFxuICAnYmFzZV5bSFRNTEVsZW1lbnRdfGhyZWYsdGFyZ2V0JyxcbiAgJ2JvZHleW0hUTUxFbGVtZW50XXxhTGluayxiYWNrZ3JvdW5kLGJnQ29sb3IsbGluaywqYWZ0ZXJwcmludCwqYmVmb3JlcHJpbnQsKmJlZm9yZXVubG9hZCwqYmx1ciwqZXJyb3IsKmZvY3VzLCpoYXNoY2hhbmdlLCpsYW5ndWFnZWNoYW5nZSwqbG9hZCwqbWVzc2FnZSwqbWVzc2FnZWVycm9yLCpvZmZsaW5lLCpvbmxpbmUsKnBhZ2VoaWRlLCpwYWdlc2hvdywqcG9wc3RhdGUsKnJlamVjdGlvbmhhbmRsZWQsKnJlc2l6ZSwqc2Nyb2xsLCpzdG9yYWdlLCp1bmhhbmRsZWRyZWplY3Rpb24sKnVubG9hZCx0ZXh0LHZMaW5rJyxcbiAgJ2J1dHRvbl5bSFRNTEVsZW1lbnRdfCFkaXNhYmxlZCxmb3JtQWN0aW9uLGZvcm1FbmN0eXBlLGZvcm1NZXRob2QsIWZvcm1Ob1ZhbGlkYXRlLGZvcm1UYXJnZXQsbmFtZSx0eXBlLHZhbHVlJyxcbiAgJ2NhbnZhc15bSFRNTEVsZW1lbnRdfCNoZWlnaHQsI3dpZHRoJyxcbiAgJ2NvbnRlbnReW0hUTUxFbGVtZW50XXxzZWxlY3QnLFxuICAnZGxeW0hUTUxFbGVtZW50XXwhY29tcGFjdCcsXG4gICdkYXRhXltIVE1MRWxlbWVudF18dmFsdWUnLFxuICAnZGF0YWxpc3ReW0hUTUxFbGVtZW50XXwnLFxuICAnZGV0YWlsc15bSFRNTEVsZW1lbnRdfCFvcGVuJyxcbiAgJ2RpYWxvZ15bSFRNTEVsZW1lbnRdfCFvcGVuLHJldHVyblZhbHVlJyxcbiAgJ2Rpcl5bSFRNTEVsZW1lbnRdfCFjb21wYWN0JyxcbiAgJ2Rpdl5bSFRNTEVsZW1lbnRdfGFsaWduJyxcbiAgJ2VtYmVkXltIVE1MRWxlbWVudF18YWxpZ24saGVpZ2h0LG5hbWUsc3JjLHR5cGUsd2lkdGgnLFxuICAnZmllbGRzZXReW0hUTUxFbGVtZW50XXwhZGlzYWJsZWQsbmFtZScsXG4gICdmb250XltIVE1MRWxlbWVudF18Y29sb3IsZmFjZSxzaXplJyxcbiAgJ2Zvcm1eW0hUTUxFbGVtZW50XXxhY2NlcHRDaGFyc2V0LGFjdGlvbixhdXRvY29tcGxldGUsZW5jb2RpbmcsZW5jdHlwZSxtZXRob2QsbmFtZSwhbm9WYWxpZGF0ZSx0YXJnZXQnLFxuICAnZnJhbWVeW0hUTUxFbGVtZW50XXxmcmFtZUJvcmRlcixsb25nRGVzYyxtYXJnaW5IZWlnaHQsbWFyZ2luV2lkdGgsbmFtZSwhbm9SZXNpemUsc2Nyb2xsaW5nLHNyYycsXG4gICdmcmFtZXNldF5bSFRNTEVsZW1lbnRdfGNvbHMsKmFmdGVycHJpbnQsKmJlZm9yZXByaW50LCpiZWZvcmV1bmxvYWQsKmJsdXIsKmVycm9yLCpmb2N1cywqaGFzaGNoYW5nZSwqbGFuZ3VhZ2VjaGFuZ2UsKmxvYWQsKm1lc3NhZ2UsKm1lc3NhZ2VlcnJvciwqb2ZmbGluZSwqb25saW5lLCpwYWdlaGlkZSwqcGFnZXNob3csKnBvcHN0YXRlLCpyZWplY3Rpb25oYW5kbGVkLCpyZXNpemUsKnNjcm9sbCwqc3RvcmFnZSwqdW5oYW5kbGVkcmVqZWN0aW9uLCp1bmxvYWQscm93cycsXG4gICdocl5bSFRNTEVsZW1lbnRdfGFsaWduLGNvbG9yLCFub1NoYWRlLHNpemUsd2lkdGgnLFxuICAnaGVhZF5bSFRNTEVsZW1lbnRdfCcsXG4gICdoMSxoMixoMyxoNCxoNSxoNl5bSFRNTEVsZW1lbnRdfGFsaWduJyxcbiAgJ2h0bWxeW0hUTUxFbGVtZW50XXx2ZXJzaW9uJyxcbiAgJ2lmcmFtZV5bSFRNTEVsZW1lbnRdfGFsaWduLGFsbG93LCFhbGxvd0Z1bGxzY3JlZW4sIWFsbG93UGF5bWVudFJlcXVlc3QsY3NwLGZyYW1lQm9yZGVyLGhlaWdodCxsb2FkaW5nLGxvbmdEZXNjLG1hcmdpbkhlaWdodCxtYXJnaW5XaWR0aCxuYW1lLHJlZmVycmVyUG9saWN5LCVzYW5kYm94LHNjcm9sbGluZyxzcmMsc3JjZG9jLHdpZHRoJyxcbiAgJ2ltZ15bSFRNTEVsZW1lbnRdfGFsaWduLGFsdCxib3JkZXIsJWNyb3NzT3JpZ2luLGRlY29kaW5nLCNoZWlnaHQsI2hzcGFjZSwhaXNNYXAsbG9hZGluZyxsb25nRGVzYyxsb3dzcmMsbmFtZSxyZWZlcnJlclBvbGljeSxzaXplcyxzcmMsc3Jjc2V0LHVzZU1hcCwjdnNwYWNlLCN3aWR0aCcsXG4gICdpbnB1dF5bSFRNTEVsZW1lbnRdfGFjY2VwdCxhbGlnbixhbHQsYXV0b2NvbXBsZXRlLCFjaGVja2VkLCFkZWZhdWx0Q2hlY2tlZCxkZWZhdWx0VmFsdWUsZGlyTmFtZSwhZGlzYWJsZWQsJWZpbGVzLGZvcm1BY3Rpb24sZm9ybUVuY3R5cGUsZm9ybU1ldGhvZCwhZm9ybU5vVmFsaWRhdGUsZm9ybVRhcmdldCwjaGVpZ2h0LCFpbmNyZW1lbnRhbCwhaW5kZXRlcm1pbmF0ZSxtYXgsI21heExlbmd0aCxtaW4sI21pbkxlbmd0aCwhbXVsdGlwbGUsbmFtZSxwYXR0ZXJuLHBsYWNlaG9sZGVyLCFyZWFkT25seSwhcmVxdWlyZWQsc2VsZWN0aW9uRGlyZWN0aW9uLCNzZWxlY3Rpb25FbmQsI3NlbGVjdGlvblN0YXJ0LCNzaXplLHNyYyxzdGVwLHR5cGUsdXNlTWFwLHZhbHVlLCV2YWx1ZUFzRGF0ZSwjdmFsdWVBc051bWJlciwjd2lkdGgnLFxuICAnbGleW0hUTUxFbGVtZW50XXx0eXBlLCN2YWx1ZScsXG4gICdsYWJlbF5bSFRNTEVsZW1lbnRdfGh0bWxGb3InLFxuICAnbGVnZW5kXltIVE1MRWxlbWVudF18YWxpZ24nLFxuICAnbGlua15bSFRNTEVsZW1lbnRdfGFzLGNoYXJzZXQsJWNyb3NzT3JpZ2luLCFkaXNhYmxlZCxocmVmLGhyZWZsYW5nLGltYWdlU2l6ZXMsaW1hZ2VTcmNzZXQsaW50ZWdyaXR5LG1lZGlhLHJlZmVycmVyUG9saWN5LHJlbCwlcmVsTGlzdCxyZXYsJXNpemVzLHRhcmdldCx0eXBlJyxcbiAgJ21hcF5bSFRNTEVsZW1lbnRdfG5hbWUnLFxuICAnbWFycXVlZV5bSFRNTEVsZW1lbnRdfGJlaGF2aW9yLGJnQ29sb3IsZGlyZWN0aW9uLGhlaWdodCwjaHNwYWNlLCNsb29wLCNzY3JvbGxBbW91bnQsI3Njcm9sbERlbGF5LCF0cnVlU3BlZWQsI3ZzcGFjZSx3aWR0aCcsXG4gICdtZW51XltIVE1MRWxlbWVudF18IWNvbXBhY3QnLFxuICAnbWV0YV5bSFRNTEVsZW1lbnRdfGNvbnRlbnQsaHR0cEVxdWl2LG1lZGlhLG5hbWUsc2NoZW1lJyxcbiAgJ21ldGVyXltIVE1MRWxlbWVudF18I2hpZ2gsI2xvdywjbWF4LCNtaW4sI29wdGltdW0sI3ZhbHVlJyxcbiAgJ2lucyxkZWxeW0hUTUxFbGVtZW50XXxjaXRlLGRhdGVUaW1lJyxcbiAgJ29sXltIVE1MRWxlbWVudF18IWNvbXBhY3QsIXJldmVyc2VkLCNzdGFydCx0eXBlJyxcbiAgJ29iamVjdF5bSFRNTEVsZW1lbnRdfGFsaWduLGFyY2hpdmUsYm9yZGVyLGNvZGUsY29kZUJhc2UsY29kZVR5cGUsZGF0YSwhZGVjbGFyZSxoZWlnaHQsI2hzcGFjZSxuYW1lLHN0YW5kYnksdHlwZSx1c2VNYXAsI3ZzcGFjZSx3aWR0aCcsXG4gICdvcHRncm91cF5bSFRNTEVsZW1lbnRdfCFkaXNhYmxlZCxsYWJlbCcsXG4gICdvcHRpb25eW0hUTUxFbGVtZW50XXwhZGVmYXVsdFNlbGVjdGVkLCFkaXNhYmxlZCxsYWJlbCwhc2VsZWN0ZWQsdGV4dCx2YWx1ZScsXG4gICdvdXRwdXReW0hUTUxFbGVtZW50XXxkZWZhdWx0VmFsdWUsJWh0bWxGb3IsbmFtZSx2YWx1ZScsXG4gICdwXltIVE1MRWxlbWVudF18YWxpZ24nLFxuICAncGFyYW1eW0hUTUxFbGVtZW50XXxuYW1lLHR5cGUsdmFsdWUsdmFsdWVUeXBlJyxcbiAgJ3BpY3R1cmVeW0hUTUxFbGVtZW50XXwnLFxuICAncHJlXltIVE1MRWxlbWVudF18I3dpZHRoJyxcbiAgJ3Byb2dyZXNzXltIVE1MRWxlbWVudF18I21heCwjdmFsdWUnLFxuICAncSxibG9ja3F1b3RlLGNpdGVeW0hUTUxFbGVtZW50XXwnLFxuICAnc2NyaXB0XltIVE1MRWxlbWVudF18IWFzeW5jLGNoYXJzZXQsJWNyb3NzT3JpZ2luLCFkZWZlcixldmVudCxodG1sRm9yLGludGVncml0eSwhbm9Nb2R1bGUsJXJlZmVycmVyUG9saWN5LHNyYyx0ZXh0LHR5cGUnLFxuICAnc2VsZWN0XltIVE1MRWxlbWVudF18YXV0b2NvbXBsZXRlLCFkaXNhYmxlZCwjbGVuZ3RoLCFtdWx0aXBsZSxuYW1lLCFyZXF1aXJlZCwjc2VsZWN0ZWRJbmRleCwjc2l6ZSx2YWx1ZScsXG4gICdzbG90XltIVE1MRWxlbWVudF18bmFtZScsXG4gICdzb3VyY2VeW0hUTUxFbGVtZW50XXwjaGVpZ2h0LG1lZGlhLHNpemVzLHNyYyxzcmNzZXQsdHlwZSwjd2lkdGgnLFxuICAnc3Bhbl5bSFRNTEVsZW1lbnRdfCcsXG4gICdzdHlsZV5bSFRNTEVsZW1lbnRdfCFkaXNhYmxlZCxtZWRpYSx0eXBlJyxcbiAgJ2NhcHRpb25eW0hUTUxFbGVtZW50XXxhbGlnbicsXG4gICd0aCx0ZF5bSFRNTEVsZW1lbnRdfGFiYnIsYWxpZ24sYXhpcyxiZ0NvbG9yLGNoLGNoT2ZmLCNjb2xTcGFuLGhlYWRlcnMsaGVpZ2h0LCFub1dyYXAsI3Jvd1NwYW4sc2NvcGUsdkFsaWduLHdpZHRoJyxcbiAgJ2NvbCxjb2xncm91cF5bSFRNTEVsZW1lbnRdfGFsaWduLGNoLGNoT2ZmLCNzcGFuLHZBbGlnbix3aWR0aCcsXG4gICd0YWJsZV5bSFRNTEVsZW1lbnRdfGFsaWduLGJnQ29sb3IsYm9yZGVyLCVjYXB0aW9uLGNlbGxQYWRkaW5nLGNlbGxTcGFjaW5nLGZyYW1lLHJ1bGVzLHN1bW1hcnksJXRGb290LCV0SGVhZCx3aWR0aCcsXG4gICd0cl5bSFRNTEVsZW1lbnRdfGFsaWduLGJnQ29sb3IsY2gsY2hPZmYsdkFsaWduJyxcbiAgJ3Rmb290LHRoZWFkLHRib2R5XltIVE1MRWxlbWVudF18YWxpZ24sY2gsY2hPZmYsdkFsaWduJyxcbiAgJ3RlbXBsYXRlXltIVE1MRWxlbWVudF18JyxcbiAgJ3RleHRhcmVhXltIVE1MRWxlbWVudF18YXV0b2NvbXBsZXRlLCNjb2xzLGRlZmF1bHRWYWx1ZSxkaXJOYW1lLCFkaXNhYmxlZCwjbWF4TGVuZ3RoLCNtaW5MZW5ndGgsbmFtZSxwbGFjZWhvbGRlciwhcmVhZE9ubHksIXJlcXVpcmVkLCNyb3dzLHNlbGVjdGlvbkRpcmVjdGlvbiwjc2VsZWN0aW9uRW5kLCNzZWxlY3Rpb25TdGFydCx2YWx1ZSx3cmFwJyxcbiAgJ3RpbWVeW0hUTUxFbGVtZW50XXxkYXRlVGltZScsXG4gICd0aXRsZV5bSFRNTEVsZW1lbnRdfHRleHQnLFxuICAndHJhY2teW0hUTUxFbGVtZW50XXwhZGVmYXVsdCxraW5kLGxhYmVsLHNyYyxzcmNsYW5nJyxcbiAgJ3VsXltIVE1MRWxlbWVudF18IWNvbXBhY3QsdHlwZScsXG4gICd1bmtub3duXltIVE1MRWxlbWVudF18JyxcbiAgJ3ZpZGVvXm1lZGlhfCFkaXNhYmxlUGljdHVyZUluUGljdHVyZSwjaGVpZ2h0LCplbnRlcnBpY3R1cmVpbnBpY3R1cmUsKmxlYXZlcGljdHVyZWlucGljdHVyZSwhcGxheXNJbmxpbmUscG9zdGVyLCN3aWR0aCcsXG4gICc6c3ZnOmFeOnN2ZzpncmFwaGljc3wnLFxuICAnOnN2ZzphbmltYXRlXjpzdmc6YW5pbWF0aW9ufCcsXG4gICc6c3ZnOmFuaW1hdGVNb3Rpb25eOnN2ZzphbmltYXRpb258JyxcbiAgJzpzdmc6YW5pbWF0ZVRyYW5zZm9ybV46c3ZnOmFuaW1hdGlvbnwnLFxuICAnOnN2ZzpjaXJjbGVeOnN2ZzpnZW9tZXRyeXwnLFxuICAnOnN2ZzpjbGlwUGF0aF46c3ZnOmdyYXBoaWNzfCcsXG4gICc6c3ZnOmRlZnNeOnN2ZzpncmFwaGljc3wnLFxuICAnOnN2ZzpkZXNjXjpzdmc6fCcsXG4gICc6c3ZnOmRpc2NhcmReOnN2Zzp8JyxcbiAgJzpzdmc6ZWxsaXBzZV46c3ZnOmdlb21ldHJ5fCcsXG4gICc6c3ZnOmZlQmxlbmReOnN2Zzp8JyxcbiAgJzpzdmc6ZmVDb2xvck1hdHJpeF46c3ZnOnwnLFxuICAnOnN2ZzpmZUNvbXBvbmVudFRyYW5zZmVyXjpzdmc6fCcsXG4gICc6c3ZnOmZlQ29tcG9zaXRlXjpzdmc6fCcsXG4gICc6c3ZnOmZlQ29udm9sdmVNYXRyaXheOnN2Zzp8JyxcbiAgJzpzdmc6ZmVEaWZmdXNlTGlnaHRpbmdeOnN2Zzp8JyxcbiAgJzpzdmc6ZmVEaXNwbGFjZW1lbnRNYXBeOnN2Zzp8JyxcbiAgJzpzdmc6ZmVEaXN0YW50TGlnaHReOnN2Zzp8JyxcbiAgJzpzdmc6ZmVEcm9wU2hhZG93Xjpzdmc6fCcsXG4gICc6c3ZnOmZlRmxvb2ReOnN2Zzp8JyxcbiAgJzpzdmc6ZmVGdW5jQV46c3ZnOmNvbXBvbmVudFRyYW5zZmVyRnVuY3Rpb258JyxcbiAgJzpzdmc6ZmVGdW5jQl46c3ZnOmNvbXBvbmVudFRyYW5zZmVyRnVuY3Rpb258JyxcbiAgJzpzdmc6ZmVGdW5jR146c3ZnOmNvbXBvbmVudFRyYW5zZmVyRnVuY3Rpb258JyxcbiAgJzpzdmc6ZmVGdW5jUl46c3ZnOmNvbXBvbmVudFRyYW5zZmVyRnVuY3Rpb258JyxcbiAgJzpzdmc6ZmVHYXVzc2lhbkJsdXJeOnN2Zzp8JyxcbiAgJzpzdmc6ZmVJbWFnZV46c3ZnOnwnLFxuICAnOnN2ZzpmZU1lcmdlXjpzdmc6fCcsXG4gICc6c3ZnOmZlTWVyZ2VOb2RlXjpzdmc6fCcsXG4gICc6c3ZnOmZlTW9ycGhvbG9neV46c3ZnOnwnLFxuICAnOnN2ZzpmZU9mZnNldF46c3ZnOnwnLFxuICAnOnN2ZzpmZVBvaW50TGlnaHReOnN2Zzp8JyxcbiAgJzpzdmc6ZmVTcGVjdWxhckxpZ2h0aW5nXjpzdmc6fCcsXG4gICc6c3ZnOmZlU3BvdExpZ2h0Xjpzdmc6fCcsXG4gICc6c3ZnOmZlVGlsZV46c3ZnOnwnLFxuICAnOnN2ZzpmZVR1cmJ1bGVuY2VeOnN2Zzp8JyxcbiAgJzpzdmc6ZmlsdGVyXjpzdmc6fCcsXG4gICc6c3ZnOmZvcmVpZ25PYmplY3ReOnN2ZzpncmFwaGljc3wnLFxuICAnOnN2ZzpnXjpzdmc6Z3JhcGhpY3N8JyxcbiAgJzpzdmc6aW1hZ2VeOnN2ZzpncmFwaGljc3xkZWNvZGluZycsXG4gICc6c3ZnOmxpbmVeOnN2ZzpnZW9tZXRyeXwnLFxuICAnOnN2ZzpsaW5lYXJHcmFkaWVudF46c3ZnOmdyYWRpZW50fCcsXG4gICc6c3ZnOm1wYXRoXjpzdmc6fCcsXG4gICc6c3ZnOm1hcmtlcl46c3ZnOnwnLFxuICAnOnN2ZzptYXNrXjpzdmc6fCcsXG4gICc6c3ZnOm1ldGFkYXRhXjpzdmc6fCcsXG4gICc6c3ZnOnBhdGheOnN2ZzpnZW9tZXRyeXwnLFxuICAnOnN2ZzpwYXR0ZXJuXjpzdmc6fCcsXG4gICc6c3ZnOnBvbHlnb25eOnN2ZzpnZW9tZXRyeXwnLFxuICAnOnN2Zzpwb2x5bGluZV46c3ZnOmdlb21ldHJ5fCcsXG4gICc6c3ZnOnJhZGlhbEdyYWRpZW50Xjpzdmc6Z3JhZGllbnR8JyxcbiAgJzpzdmc6cmVjdF46c3ZnOmdlb21ldHJ5fCcsXG4gICc6c3ZnOnN2Z146c3ZnOmdyYXBoaWNzfCNjdXJyZW50U2NhbGUsI3pvb21BbmRQYW4nLFxuICAnOnN2ZzpzY3JpcHReOnN2Zzp8dHlwZScsXG4gICc6c3ZnOnNldF46c3ZnOmFuaW1hdGlvbnwnLFxuICAnOnN2ZzpzdG9wXjpzdmc6fCcsXG4gICc6c3ZnOnN0eWxlXjpzdmc6fCFkaXNhYmxlZCxtZWRpYSx0aXRsZSx0eXBlJyxcbiAgJzpzdmc6c3dpdGNoXjpzdmc6Z3JhcGhpY3N8JyxcbiAgJzpzdmc6c3ltYm9sXjpzdmc6fCcsXG4gICc6c3ZnOnRzcGFuXjpzdmc6dGV4dFBvc2l0aW9uaW5nfCcsXG4gICc6c3ZnOnRleHReOnN2Zzp0ZXh0UG9zaXRpb25pbmd8JyxcbiAgJzpzdmc6dGV4dFBhdGheOnN2Zzp0ZXh0Q29udGVudHwnLFxuICAnOnN2Zzp0aXRsZV46c3ZnOnwnLFxuICAnOnN2Zzp1c2VeOnN2ZzpncmFwaGljc3wnLFxuICAnOnN2Zzp2aWV3Xjpzdmc6fCN6b29tQW5kUGFuJyxcbiAgJ2RhdGFeW0hUTUxFbGVtZW50XXx2YWx1ZScsXG4gICdrZXlnZW5eW0hUTUxFbGVtZW50XXwhYXV0b2ZvY3VzLGNoYWxsZW5nZSwhZGlzYWJsZWQsZm9ybSxrZXl0eXBlLG5hbWUnLFxuICAnbWVudWl0ZW1eW0hUTUxFbGVtZW50XXx0eXBlLGxhYmVsLGljb24sIWRpc2FibGVkLCFjaGVja2VkLHJhZGlvZ3JvdXAsIWRlZmF1bHQnLFxuICAnc3VtbWFyeV5bSFRNTEVsZW1lbnRdfCcsXG4gICd0aW1lXltIVE1MRWxlbWVudF18ZGF0ZVRpbWUnLFxuICAnOnN2ZzpjdXJzb3JeOnN2Zzp8Jyxcbl07XG5cbmNvbnN0IF9BVFRSX1RPX1BST1AgPSBuZXcgTWFwKE9iamVjdC5lbnRyaWVzKHtcbiAgJ2NsYXNzJzogJ2NsYXNzTmFtZScsXG4gICdmb3InOiAnaHRtbEZvcicsXG4gICdmb3JtYWN0aW9uJzogJ2Zvcm1BY3Rpb24nLFxuICAnaW5uZXJIdG1sJzogJ2lubmVySFRNTCcsXG4gICdyZWFkb25seSc6ICdyZWFkT25seScsXG4gICd0YWJpbmRleCc6ICd0YWJJbmRleCcsXG59KSk7XG5cbi8vIEludmVydCBfQVRUUl9UT19QUk9QLlxuY29uc3QgX1BST1BfVE9fQVRUUiA9XG4gICAgQXJyYXkuZnJvbShfQVRUUl9UT19QUk9QKS5yZWR1Y2UoKGludmVydGVkLCBbcHJvcGVydHlOYW1lLCBhdHRyaWJ1dGVOYW1lXSkgPT4ge1xuICAgICAgaW52ZXJ0ZWQuc2V0KHByb3BlcnR5TmFtZSwgYXR0cmlidXRlTmFtZSk7XG4gICAgICByZXR1cm4gaW52ZXJ0ZWQ7XG4gICAgfSwgbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKSk7XG5cbmV4cG9ydCBjbGFzcyBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkgZXh0ZW5kcyBFbGVtZW50U2NoZW1hUmVnaXN0cnkge1xuICBwcml2YXRlIF9zY2hlbWEgPSBuZXcgTWFwPHN0cmluZywgTWFwPHN0cmluZywgc3RyaW5nPj4oKTtcbiAgLy8gV2UgZG9uJ3QgYWxsb3cgYmluZGluZyB0byBldmVudHMgZm9yIHNlY3VyaXR5IHJlYXNvbnMuIEFsbG93aW5nIGV2ZW50IGJpbmRpbmdzIHdvdWxkIGFsbW9zdFxuICAvLyBjZXJ0YWlubHkgaW50cm9kdWNlIGJhZCBYU1MgdnVsbmVyYWJpbGl0aWVzLiBJbnN0ZWFkLCB3ZSBzdG9yZSBldmVudHMgaW4gYSBzZXBhcmF0ZSBzY2hlbWEuXG4gIHByaXZhdGUgX2V2ZW50U2NoZW1hID0gbmV3IE1hcDxzdHJpbmcsIFNldDxzdHJpbmc+PjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIFNDSEVNQS5mb3JFYWNoKGVuY29kZWRUeXBlID0+IHtcbiAgICAgIGNvbnN0IHR5cGUgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICAgICAgY29uc3QgZXZlbnRzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoKTtcbiAgICAgIGNvbnN0IFtzdHJUeXBlLCBzdHJQcm9wZXJ0aWVzXSA9IGVuY29kZWRUeXBlLnNwbGl0KCd8Jyk7XG4gICAgICBjb25zdCBwcm9wZXJ0aWVzID0gc3RyUHJvcGVydGllcy5zcGxpdCgnLCcpO1xuICAgICAgY29uc3QgW3R5cGVOYW1lcywgc3VwZXJOYW1lXSA9IHN0clR5cGUuc3BsaXQoJ14nKTtcbiAgICAgIHR5cGVOYW1lcy5zcGxpdCgnLCcpLmZvckVhY2godGFnID0+IHtcbiAgICAgICAgdGhpcy5fc2NoZW1hLnNldCh0YWcudG9Mb3dlckNhc2UoKSwgdHlwZSk7XG4gICAgICAgIHRoaXMuX2V2ZW50U2NoZW1hLnNldCh0YWcudG9Mb3dlckNhc2UoKSwgZXZlbnRzKTtcbiAgICAgIH0pO1xuICAgICAgY29uc3Qgc3VwZXJUeXBlID0gc3VwZXJOYW1lICYmIHRoaXMuX3NjaGVtYS5nZXQoc3VwZXJOYW1lLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgaWYgKHN1cGVyVHlwZSkge1xuICAgICAgICBmb3IgKGNvbnN0IFtwcm9wLCB2YWx1ZV0gb2Ygc3VwZXJUeXBlKSB7XG4gICAgICAgICAgdHlwZS5zZXQocHJvcCwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qgc3VwZXJFdmVudCBvZiB0aGlzLl9ldmVudFNjaGVtYS5nZXQoc3VwZXJOYW1lLnRvTG93ZXJDYXNlKCkpISkge1xuICAgICAgICAgIGV2ZW50cy5hZGQoc3VwZXJFdmVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHByb3BlcnRpZXMuZm9yRWFjaCgocHJvcGVydHk6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAocHJvcGVydHkubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHN3aXRjaCAocHJvcGVydHlbMF0pIHtcbiAgICAgICAgICAgIGNhc2UgJyonOlxuICAgICAgICAgICAgICBldmVudHMuYWRkKHByb3BlcnR5LnN1YnN0cmluZygxKSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnISc6XG4gICAgICAgICAgICAgIHR5cGUuc2V0KHByb3BlcnR5LnN1YnN0cmluZygxKSwgQk9PTEVBTik7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgICAgIHR5cGUuc2V0KHByb3BlcnR5LnN1YnN0cmluZygxKSwgTlVNQkVSKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICclJzpcbiAgICAgICAgICAgICAgdHlwZS5zZXQocHJvcGVydHkuc3Vic3RyaW5nKDEpLCBPQkpFQ1QpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHR5cGUuc2V0KHByb3BlcnR5LCBTVFJJTkcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBvdmVycmlkZSBoYXNQcm9wZXJ0eSh0YWdOYW1lOiBzdHJpbmcsIHByb3BOYW1lOiBzdHJpbmcsIHNjaGVtYU1ldGFzOiBTY2hlbWFNZXRhZGF0YVtdKTogYm9vbGVhbiB7XG4gICAgaWYgKHNjaGVtYU1ldGFzLnNvbWUoKHNjaGVtYSkgPT4gc2NoZW1hLm5hbWUgPT09IE5PX0VSUk9SU19TQ0hFTUEubmFtZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmICh0YWdOYW1lLmluZGV4T2YoJy0nKSA+IC0xKSB7XG4gICAgICBpZiAoaXNOZ0NvbnRhaW5lcih0YWdOYW1lKSB8fCBpc05nQ29udGVudCh0YWdOYW1lKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmIChzY2hlbWFNZXRhcy5zb21lKChzY2hlbWEpID0+IHNjaGVtYS5uYW1lID09PSBDVVNUT01fRUxFTUVOVFNfU0NIRU1BLm5hbWUpKSB7XG4gICAgICAgIC8vIENhbid0IHRlbGwgbm93IGFzIHdlIGRvbid0IGtub3cgd2hpY2ggcHJvcGVydGllcyBhIGN1c3RvbSBlbGVtZW50IHdpbGwgZ2V0XG4gICAgICAgIC8vIG9uY2UgaXQgaXMgaW5zdGFudGlhdGVkXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGVsZW1lbnRQcm9wZXJ0aWVzID1cbiAgICAgICAgdGhpcy5fc2NoZW1hLmdldCh0YWdOYW1lLnRvTG93ZXJDYXNlKCkpIHx8IHRoaXMuX3NjaGVtYS5nZXQoJ3Vua25vd24nKSE7XG4gICAgcmV0dXJuIGVsZW1lbnRQcm9wZXJ0aWVzLmhhcyhwcm9wTmFtZSk7XG4gIH1cblxuICBvdmVycmlkZSBoYXNFbGVtZW50KHRhZ05hbWU6IHN0cmluZywgc2NoZW1hTWV0YXM6IFNjaGVtYU1ldGFkYXRhW10pOiBib29sZWFuIHtcbiAgICBpZiAoc2NoZW1hTWV0YXMuc29tZSgoc2NoZW1hKSA9PiBzY2hlbWEubmFtZSA9PT0gTk9fRVJST1JTX1NDSEVNQS5uYW1lKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHRhZ05hbWUuaW5kZXhPZignLScpID4gLTEpIHtcbiAgICAgIGlmIChpc05nQ29udGFpbmVyKHRhZ05hbWUpIHx8IGlzTmdDb250ZW50KHRhZ05hbWUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2NoZW1hTWV0YXMuc29tZSgoc2NoZW1hKSA9PiBzY2hlbWEubmFtZSA9PT0gQ1VTVE9NX0VMRU1FTlRTX1NDSEVNQS5uYW1lKSkge1xuICAgICAgICAvLyBBbGxvdyBhbnkgY3VzdG9tIGVsZW1lbnRzXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9zY2hlbWEuaGFzKHRhZ05hbWUudG9Mb3dlckNhc2UoKSk7XG4gIH1cblxuICAvKipcbiAgICogc2VjdXJpdHlDb250ZXh0IHJldHVybnMgdGhlIHNlY3VyaXR5IGNvbnRleHQgZm9yIHRoZSBnaXZlbiBwcm9wZXJ0eSBvbiB0aGUgZ2l2ZW4gRE9NIHRhZy5cbiAgICpcbiAgICogVGFnIGFuZCBwcm9wZXJ0eSBuYW1lIGFyZSBzdGF0aWNhbGx5IGtub3duIGFuZCBjYW5ub3QgY2hhbmdlIGF0IHJ1bnRpbWUsIGkuZS4gaXQgaXMgbm90XG4gICAqIHBvc3NpYmxlIHRvIGJpbmQgYSB2YWx1ZSBpbnRvIGEgY2hhbmdpbmcgYXR0cmlidXRlIG9yIHRhZyBuYW1lLlxuICAgKlxuICAgKiBUaGUgZmlsdGVyaW5nIGlzIGJhc2VkIG9uIGEgbGlzdCBvZiBhbGxvd2VkIHRhZ3N8YXR0cmlidXRlcy4gQWxsIGF0dHJpYnV0ZXMgaW4gdGhlIHNjaGVtYVxuICAgKiBhYm92ZSBhcmUgYXNzdW1lZCB0byBoYXZlIHRoZSAnTk9ORScgc2VjdXJpdHkgY29udGV4dCwgaS5lLiB0aGF0IHRoZXkgYXJlIHNhZmUgaW5lcnRcbiAgICogc3RyaW5nIHZhbHVlcy4gT25seSBzcGVjaWZpYyB3ZWxsIGtub3duIGF0dGFjayB2ZWN0b3JzIGFyZSBhc3NpZ25lZCB0aGVpciBhcHByb3ByaWF0ZSBjb250ZXh0LlxuICAgKi9cbiAgb3ZlcnJpZGUgc2VjdXJpdHlDb250ZXh0KHRhZ05hbWU6IHN0cmluZywgcHJvcE5hbWU6IHN0cmluZywgaXNBdHRyaWJ1dGU6IGJvb2xlYW4pOlxuICAgICAgU2VjdXJpdHlDb250ZXh0IHtcbiAgICBpZiAoaXNBdHRyaWJ1dGUpIHtcbiAgICAgIC8vIE5COiBGb3Igc2VjdXJpdHkgcHVycG9zZXMsIHVzZSB0aGUgbWFwcGVkIHByb3BlcnR5IG5hbWUsIG5vdCB0aGUgYXR0cmlidXRlIG5hbWUuXG4gICAgICBwcm9wTmFtZSA9IHRoaXMuZ2V0TWFwcGVkUHJvcE5hbWUocHJvcE5hbWUpO1xuICAgIH1cblxuICAgIC8vIE1ha2Ugc3VyZSBjb21wYXJpc29ucyBhcmUgY2FzZSBpbnNlbnNpdGl2ZSwgc28gdGhhdCBjYXNlIGRpZmZlcmVuY2VzIGJldHdlZW4gYXR0cmlidXRlIGFuZFxuICAgIC8vIHByb3BlcnR5IG5hbWVzIGRvIG5vdCBoYXZlIGEgc2VjdXJpdHkgaW1wYWN0LlxuICAgIHRhZ05hbWUgPSB0YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgcHJvcE5hbWUgPSBwcm9wTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIGxldCBjdHggPSBTRUNVUklUWV9TQ0hFTUEoKVt0YWdOYW1lICsgJ3wnICsgcHJvcE5hbWVdO1xuICAgIGlmIChjdHgpIHtcbiAgICAgIHJldHVybiBjdHg7XG4gICAgfVxuICAgIGN0eCA9IFNFQ1VSSVRZX1NDSEVNQSgpWycqfCcgKyBwcm9wTmFtZV07XG4gICAgcmV0dXJuIGN0eCA/IGN0eCA6IFNlY3VyaXR5Q29udGV4dC5OT05FO1xuICB9XG5cbiAgb3ZlcnJpZGUgZ2V0TWFwcGVkUHJvcE5hbWUocHJvcE5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIF9BVFRSX1RPX1BST1AuZ2V0KHByb3BOYW1lKSA/PyBwcm9wTmFtZTtcbiAgfVxuXG4gIG92ZXJyaWRlIGdldERlZmF1bHRDb21wb25lbnRFbGVtZW50TmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnbmctY29tcG9uZW50JztcbiAgfVxuXG4gIG92ZXJyaWRlIHZhbGlkYXRlUHJvcGVydHkobmFtZTogc3RyaW5nKToge2Vycm9yOiBib29sZWFuLCBtc2c/OiBzdHJpbmd9IHtcbiAgICBpZiAobmFtZS50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGgoJ29uJykpIHtcbiAgICAgIGNvbnN0IG1zZyA9IGBCaW5kaW5nIHRvIGV2ZW50IHByb3BlcnR5ICcke25hbWV9JyBpcyBkaXNhbGxvd2VkIGZvciBzZWN1cml0eSByZWFzb25zLCBgICtcbiAgICAgICAgICBgcGxlYXNlIHVzZSAoJHtuYW1lLnNsaWNlKDIpfSk9Li4uYCArXG4gICAgICAgICAgYFxcbklmICcke25hbWV9JyBpcyBhIGRpcmVjdGl2ZSBpbnB1dCwgbWFrZSBzdXJlIHRoZSBkaXJlY3RpdmUgaXMgaW1wb3J0ZWQgYnkgdGhlYCArXG4gICAgICAgICAgYCBjdXJyZW50IG1vZHVsZS5gO1xuICAgICAgcmV0dXJuIHtlcnJvcjogdHJ1ZSwgbXNnOiBtc2d9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge2Vycm9yOiBmYWxzZX07XG4gICAgfVxuICB9XG5cbiAgb3ZlcnJpZGUgdmFsaWRhdGVBdHRyaWJ1dGUobmFtZTogc3RyaW5nKToge2Vycm9yOiBib29sZWFuLCBtc2c/OiBzdHJpbmd9IHtcbiAgICBpZiAobmFtZS50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGgoJ29uJykpIHtcbiAgICAgIGNvbnN0IG1zZyA9IGBCaW5kaW5nIHRvIGV2ZW50IGF0dHJpYnV0ZSAnJHtuYW1lfScgaXMgZGlzYWxsb3dlZCBmb3Igc2VjdXJpdHkgcmVhc29ucywgYCArXG4gICAgICAgICAgYHBsZWFzZSB1c2UgKCR7bmFtZS5zbGljZSgyKX0pPS4uLmA7XG4gICAgICByZXR1cm4ge2Vycm9yOiB0cnVlLCBtc2c6IG1zZ307XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7ZXJyb3I6IGZhbHNlfTtcbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBhbGxLbm93bkVsZW1lbnROYW1lcygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fc2NoZW1hLmtleXMoKSk7XG4gIH1cblxuICBhbGxLbm93bkF0dHJpYnV0ZXNPZkVsZW1lbnQodGFnTmFtZTogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IGVsZW1lbnRQcm9wZXJ0aWVzID1cbiAgICAgICAgdGhpcy5fc2NoZW1hLmdldCh0YWdOYW1lLnRvTG93ZXJDYXNlKCkpIHx8IHRoaXMuX3NjaGVtYS5nZXQoJ3Vua25vd24nKSE7XG4gICAgLy8gQ29udmVydCBwcm9wZXJ0aWVzIHRvIGF0dHJpYnV0ZXMuXG4gICAgcmV0dXJuIEFycmF5LmZyb20oZWxlbWVudFByb3BlcnRpZXMua2V5cygpKS5tYXAocHJvcCA9PiBfUFJPUF9UT19BVFRSLmdldChwcm9wKSA/PyBwcm9wKTtcbiAgfVxuXG4gIGFsbEtub3duRXZlbnRzT2ZFbGVtZW50KHRhZ05hbWU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9ldmVudFNjaGVtYS5nZXQodGFnTmFtZS50b0xvd2VyQ2FzZSgpKSA/PyBbXSk7XG4gIH1cblxuICBvdmVycmlkZSBub3JtYWxpemVBbmltYXRpb25TdHlsZVByb3BlcnR5KHByb3BOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBkYXNoQ2FzZVRvQ2FtZWxDYXNlKHByb3BOYW1lKTtcbiAgfVxuXG4gIG92ZXJyaWRlIG5vcm1hbGl6ZUFuaW1hdGlvblN0eWxlVmFsdWUoXG4gICAgICBjYW1lbENhc2VQcm9wOiBzdHJpbmcsIHVzZXJQcm92aWRlZFByb3A6IHN0cmluZyxcbiAgICAgIHZhbDogc3RyaW5nfG51bWJlcik6IHtlcnJvcjogc3RyaW5nLCB2YWx1ZTogc3RyaW5nfSB7XG4gICAgbGV0IHVuaXQ6IHN0cmluZyA9ICcnO1xuICAgIGNvbnN0IHN0clZhbCA9IHZhbC50b1N0cmluZygpLnRyaW0oKTtcbiAgICBsZXQgZXJyb3JNc2c6IHN0cmluZyA9IG51bGwhO1xuXG4gICAgaWYgKF9pc1BpeGVsRGltZW5zaW9uU3R5bGUoY2FtZWxDYXNlUHJvcCkgJiYgdmFsICE9PSAwICYmIHZhbCAhPT0gJzAnKSB7XG4gICAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgdW5pdCA9ICdweCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB2YWxBbmRTdWZmaXhNYXRjaCA9IHZhbC5tYXRjaCgvXlsrLV0/W1xcZFxcLl0rKFthLXpdKikkLyk7XG4gICAgICAgIGlmICh2YWxBbmRTdWZmaXhNYXRjaCAmJiB2YWxBbmRTdWZmaXhNYXRjaFsxXS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgIGVycm9yTXNnID0gYFBsZWFzZSBwcm92aWRlIGEgQ1NTIHVuaXQgdmFsdWUgZm9yICR7dXNlclByb3ZpZGVkUHJvcH06JHt2YWx9YDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge2Vycm9yOiBlcnJvck1zZywgdmFsdWU6IHN0clZhbCArIHVuaXR9O1xuICB9XG59XG5cbmZ1bmN0aW9uIF9pc1BpeGVsRGltZW5zaW9uU3R5bGUocHJvcDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHN3aXRjaCAocHJvcCkge1xuICAgIGNhc2UgJ3dpZHRoJzpcbiAgICBjYXNlICdoZWlnaHQnOlxuICAgIGNhc2UgJ21pbldpZHRoJzpcbiAgICBjYXNlICdtaW5IZWlnaHQnOlxuICAgIGNhc2UgJ21heFdpZHRoJzpcbiAgICBjYXNlICdtYXhIZWlnaHQnOlxuICAgIGNhc2UgJ2xlZnQnOlxuICAgIGNhc2UgJ3RvcCc6XG4gICAgY2FzZSAnYm90dG9tJzpcbiAgICBjYXNlICdyaWdodCc6XG4gICAgY2FzZSAnZm9udFNpemUnOlxuICAgIGNhc2UgJ291dGxpbmVXaWR0aCc6XG4gICAgY2FzZSAnb3V0bGluZU9mZnNldCc6XG4gICAgY2FzZSAncGFkZGluZ1RvcCc6XG4gICAgY2FzZSAncGFkZGluZ0xlZnQnOlxuICAgIGNhc2UgJ3BhZGRpbmdCb3R0b20nOlxuICAgIGNhc2UgJ3BhZGRpbmdSaWdodCc6XG4gICAgY2FzZSAnbWFyZ2luVG9wJzpcbiAgICBjYXNlICdtYXJnaW5MZWZ0JzpcbiAgICBjYXNlICdtYXJnaW5Cb3R0b20nOlxuICAgIGNhc2UgJ21hcmdpblJpZ2h0JzpcbiAgICBjYXNlICdib3JkZXJSYWRpdXMnOlxuICAgIGNhc2UgJ2JvcmRlcldpZHRoJzpcbiAgICBjYXNlICdib3JkZXJUb3BXaWR0aCc6XG4gICAgY2FzZSAnYm9yZGVyTGVmdFdpZHRoJzpcbiAgICBjYXNlICdib3JkZXJSaWdodFdpZHRoJzpcbiAgICBjYXNlICdib3JkZXJCb3R0b21XaWR0aCc6XG4gICAgY2FzZSAndGV4dEluZGVudCc6XG4gICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiJdfQ==
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/schema/dom_element_schema_registry", ["require", "exports", "tslib", "@angular/compiler/src/core", "@angular/compiler/src/ml_parser/tags", "@angular/compiler/src/util", "@angular/compiler/src/schema/dom_security_schema", "@angular/compiler/src/schema/element_schema_registry"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DomElementSchemaRegistry = void 0;
    var tslib_1 = require("tslib");
    var core_1 = require("@angular/compiler/src/core");
    var tags_1 = require("@angular/compiler/src/ml_parser/tags");
    var util_1 = require("@angular/compiler/src/util");
    var dom_security_schema_1 = require("@angular/compiler/src/schema/dom_security_schema");
    var element_schema_registry_1 = require("@angular/compiler/src/schema/element_schema_registry");
    var BOOLEAN = 'boolean';
    var NUMBER = 'number';
    var STRING = 'string';
    var OBJECT = 'object';
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
    var SCHEMA = [
        '[Element]|textContent,%classList,className,id,innerHTML,*beforecopy,*beforecut,*beforepaste,*copy,*cut,*paste,*search,*selectstart,*webkitfullscreenchange,*webkitfullscreenerror,*wheel,outerHTML,#scrollLeft,#scrollTop,slot' +
            /* added manually to avoid breaking changes */
            ',*message,*mozfullscreenchange,*mozfullscreenerror,*mozpointerlockchange,*mozpointerlockerror,*webglcontextcreationerror,*webglcontextlost,*webglcontextrestored',
        '[HTMLElement]^[Element]|accessKey,contentEditable,dir,!draggable,!hidden,innerText,lang,*abort,*auxclick,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*cuechange,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*seeked,*seeking,*select,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,outerText,!spellcheck,%style,#tabIndex,title,!translate',
        'abbr,address,article,aside,b,bdi,bdo,cite,code,dd,dfn,dt,em,figcaption,figure,footer,header,i,kbd,main,mark,nav,noscript,rb,rp,rt,rtc,ruby,s,samp,section,small,strong,sub,sup,u,var,wbr^[HTMLElement]|accessKey,contentEditable,dir,!draggable,!hidden,innerText,lang,*abort,*auxclick,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*cuechange,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*seeked,*seeking,*select,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,outerText,!spellcheck,%style,#tabIndex,title,!translate',
        'media^[HTMLElement]|!autoplay,!controls,%controlsList,%crossOrigin,#currentTime,!defaultMuted,#defaultPlaybackRate,!disableRemotePlayback,!loop,!muted,*encrypted,*waitingforkey,#playbackRate,preload,src,%srcObject,#volume',
        ':svg:^[HTMLElement]|*abort,*auxclick,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*cuechange,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*seeked,*seeking,*select,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,%style,#tabIndex',
        ':svg:graphics^:svg:|',
        ':svg:animation^:svg:|*begin,*end,*repeat',
        ':svg:geometry^:svg:|',
        ':svg:componentTransferFunction^:svg:|',
        ':svg:gradient^:svg:|',
        ':svg:textContent^:svg:graphics|',
        ':svg:textPositioning^:svg:textContent|',
        'a^[HTMLElement]|charset,coords,download,hash,host,hostname,href,hreflang,name,password,pathname,ping,port,protocol,referrerPolicy,rel,rev,search,shape,target,text,type,username',
        'area^[HTMLElement]|alt,coords,download,hash,host,hostname,href,!noHref,password,pathname,ping,port,protocol,referrerPolicy,rel,search,shape,target,username',
        'audio^media|',
        'br^[HTMLElement]|clear',
        'base^[HTMLElement]|href,target',
        'body^[HTMLElement]|aLink,background,bgColor,link,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,text,vLink',
        'button^[HTMLElement]|!autofocus,!disabled,formAction,formEnctype,formMethod,!formNoValidate,formTarget,name,type,value',
        'canvas^[HTMLElement]|#height,#width',
        'content^[HTMLElement]|select',
        'dl^[HTMLElement]|!compact',
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
        'frameset^[HTMLElement]|cols,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,rows',
        'hr^[HTMLElement]|align,color,!noShade,size,width',
        'head^[HTMLElement]|',
        'h1,h2,h3,h4,h5,h6^[HTMLElement]|align',
        'html^[HTMLElement]|version',
        'iframe^[HTMLElement]|align,!allowFullscreen,frameBorder,height,longDesc,marginHeight,marginWidth,name,referrerPolicy,%sandbox,scrolling,src,srcdoc,width',
        'img^[HTMLElement]|align,alt,border,%crossOrigin,#height,#hspace,!isMap,longDesc,lowsrc,name,referrerPolicy,sizes,src,srcset,useMap,#vspace,#width',
        'input^[HTMLElement]|accept,align,alt,autocapitalize,autocomplete,!autofocus,!checked,!defaultChecked,defaultValue,dirName,!disabled,%files,formAction,formEnctype,formMethod,!formNoValidate,formTarget,#height,!incremental,!indeterminate,max,#maxLength,min,#minLength,!multiple,name,pattern,placeholder,!readOnly,!required,selectionDirection,#selectionEnd,#selectionStart,#size,src,step,type,useMap,value,%valueAsDate,#valueAsNumber,#width',
        'li^[HTMLElement]|type,#value',
        'label^[HTMLElement]|htmlFor',
        'legend^[HTMLElement]|align',
        'link^[HTMLElement]|as,charset,%crossOrigin,!disabled,href,hreflang,integrity,media,referrerPolicy,rel,%relList,rev,%sizes,target,type',
        'map^[HTMLElement]|name',
        'marquee^[HTMLElement]|behavior,bgColor,direction,height,#hspace,#loop,#scrollAmount,#scrollDelay,!trueSpeed,#vspace,width',
        'menu^[HTMLElement]|!compact',
        'meta^[HTMLElement]|content,httpEquiv,name,scheme',
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
        'script^[HTMLElement]|!async,charset,%crossOrigin,!defer,event,htmlFor,integrity,src,text,type',
        'select^[HTMLElement]|autocomplete,!autofocus,!disabled,#length,!multiple,name,!required,#selectedIndex,#size,value',
        'shadow^[HTMLElement]|',
        'slot^[HTMLElement]|name',
        'source^[HTMLElement]|media,sizes,src,srcset,type',
        'span^[HTMLElement]|',
        'style^[HTMLElement]|!disabled,media,type',
        'caption^[HTMLElement]|align',
        'th,td^[HTMLElement]|abbr,align,axis,bgColor,ch,chOff,#colSpan,headers,height,!noWrap,#rowSpan,scope,vAlign,width',
        'col,colgroup^[HTMLElement]|align,ch,chOff,#span,vAlign,width',
        'table^[HTMLElement]|align,bgColor,border,%caption,cellPadding,cellSpacing,frame,rules,summary,%tFoot,%tHead,width',
        'tr^[HTMLElement]|align,bgColor,ch,chOff,vAlign',
        'tfoot,thead,tbody^[HTMLElement]|align,ch,chOff,vAlign',
        'template^[HTMLElement]|',
        'textarea^[HTMLElement]|autocapitalize,autocomplete,!autofocus,#cols,defaultValue,dirName,!disabled,#maxLength,#minLength,name,placeholder,!readOnly,!required,#rows,selectionDirection,#selectionEnd,#selectionStart,value,wrap',
        'title^[HTMLElement]|text',
        'track^[HTMLElement]|!default,kind,label,src,srclang',
        'ul^[HTMLElement]|!compact,type',
        'unknown^[HTMLElement]|',
        'video^media|#height,poster,#width',
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
        ':svg:image^:svg:graphics|',
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
    var _ATTR_TO_PROP = {
        'class': 'className',
        'for': 'htmlFor',
        'formaction': 'formAction',
        'innerHtml': 'innerHTML',
        'readonly': 'readOnly',
        'tabindex': 'tabIndex',
    };
    // Invert _ATTR_TO_PROP.
    var _PROP_TO_ATTR = Object.keys(_ATTR_TO_PROP).reduce(function (inverted, attr) {
        inverted[_ATTR_TO_PROP[attr]] = attr;
        return inverted;
    }, {});
    var DomElementSchemaRegistry = /** @class */ (function (_super) {
        tslib_1.__extends(DomElementSchemaRegistry, _super);
        function DomElementSchemaRegistry() {
            var _this = _super.call(this) || this;
            _this._schema = {};
            SCHEMA.forEach(function (encodedType) {
                var type = {};
                var _a = tslib_1.__read(encodedType.split('|'), 2), strType = _a[0], strProperties = _a[1];
                var properties = strProperties.split(',');
                var _b = tslib_1.__read(strType.split('^'), 2), typeNames = _b[0], superName = _b[1];
                typeNames.split(',').forEach(function (tag) { return _this._schema[tag.toLowerCase()] = type; });
                var superType = superName && _this._schema[superName.toLowerCase()];
                if (superType) {
                    Object.keys(superType).forEach(function (prop) {
                        type[prop] = superType[prop];
                    });
                }
                properties.forEach(function (property) {
                    if (property.length > 0) {
                        switch (property[0]) {
                            case '*':
                                // We don't yet support events.
                                // If ever allowing to bind to events, GO THROUGH A SECURITY REVIEW, allowing events
                                // will
                                // almost certainly introduce bad XSS vulnerabilities.
                                // type[property.substring(1)] = EVENT;
                                break;
                            case '!':
                                type[property.substring(1)] = BOOLEAN;
                                break;
                            case '#':
                                type[property.substring(1)] = NUMBER;
                                break;
                            case '%':
                                type[property.substring(1)] = OBJECT;
                                break;
                            default:
                                type[property] = STRING;
                        }
                    }
                });
            });
            return _this;
        }
        DomElementSchemaRegistry.prototype.hasProperty = function (tagName, propName, schemaMetas) {
            if (schemaMetas.some(function (schema) { return schema.name === core_1.NO_ERRORS_SCHEMA.name; })) {
                return true;
            }
            if (tagName.indexOf('-') > -1) {
                if (tags_1.isNgContainer(tagName) || tags_1.isNgContent(tagName)) {
                    return false;
                }
                if (schemaMetas.some(function (schema) { return schema.name === core_1.CUSTOM_ELEMENTS_SCHEMA.name; })) {
                    // Can't tell now as we don't know which properties a custom element will get
                    // once it is instantiated
                    return true;
                }
            }
            var elementProperties = this._schema[tagName.toLowerCase()] || this._schema['unknown'];
            return !!elementProperties[propName];
        };
        DomElementSchemaRegistry.prototype.hasElement = function (tagName, schemaMetas) {
            if (schemaMetas.some(function (schema) { return schema.name === core_1.NO_ERRORS_SCHEMA.name; })) {
                return true;
            }
            if (tagName.indexOf('-') > -1) {
                if (tags_1.isNgContainer(tagName) || tags_1.isNgContent(tagName)) {
                    return true;
                }
                if (schemaMetas.some(function (schema) { return schema.name === core_1.CUSTOM_ELEMENTS_SCHEMA.name; })) {
                    // Allow any custom elements
                    return true;
                }
            }
            return !!this._schema[tagName.toLowerCase()];
        };
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
        DomElementSchemaRegistry.prototype.securityContext = function (tagName, propName, isAttribute) {
            if (isAttribute) {
                // NB: For security purposes, use the mapped property name, not the attribute name.
                propName = this.getMappedPropName(propName);
            }
            // Make sure comparisons are case insensitive, so that case differences between attribute and
            // property names do not have a security impact.
            tagName = tagName.toLowerCase();
            propName = propName.toLowerCase();
            var ctx = dom_security_schema_1.SECURITY_SCHEMA()[tagName + '|' + propName];
            if (ctx) {
                return ctx;
            }
            ctx = dom_security_schema_1.SECURITY_SCHEMA()['*|' + propName];
            return ctx ? ctx : core_1.SecurityContext.NONE;
        };
        DomElementSchemaRegistry.prototype.getMappedPropName = function (propName) {
            return _ATTR_TO_PROP[propName] || propName;
        };
        DomElementSchemaRegistry.prototype.getDefaultComponentElementName = function () {
            return 'ng-component';
        };
        DomElementSchemaRegistry.prototype.validateProperty = function (name) {
            if (name.toLowerCase().startsWith('on')) {
                var msg = "Binding to event property '" + name + "' is disallowed for security reasons, " +
                    ("please use (" + name.slice(2) + ")=...") +
                    ("\nIf '" + name + "' is a directive input, make sure the directive is imported by the") +
                    " current module.";
                return { error: true, msg: msg };
            }
            else {
                return { error: false };
            }
        };
        DomElementSchemaRegistry.prototype.validateAttribute = function (name) {
            if (name.toLowerCase().startsWith('on')) {
                var msg = "Binding to event attribute '" + name + "' is disallowed for security reasons, " +
                    ("please use (" + name.slice(2) + ")=...");
                return { error: true, msg: msg };
            }
            else {
                return { error: false };
            }
        };
        DomElementSchemaRegistry.prototype.allKnownElementNames = function () {
            return Object.keys(this._schema);
        };
        DomElementSchemaRegistry.prototype.allKnownAttributesOfElement = function (tagName) {
            var elementProperties = this._schema[tagName.toLowerCase()] || this._schema['unknown'];
            // Convert properties to attributes.
            return Object.keys(elementProperties).map(function (prop) { var _a; return (_a = _PROP_TO_ATTR[prop]) !== null && _a !== void 0 ? _a : prop; });
        };
        DomElementSchemaRegistry.prototype.normalizeAnimationStyleProperty = function (propName) {
            return util_1.dashCaseToCamelCase(propName);
        };
        DomElementSchemaRegistry.prototype.normalizeAnimationStyleValue = function (camelCaseProp, userProvidedProp, val) {
            var unit = '';
            var strVal = val.toString().trim();
            var errorMsg = null;
            if (_isPixelDimensionStyle(camelCaseProp) && val !== 0 && val !== '0') {
                if (typeof val === 'number') {
                    unit = 'px';
                }
                else {
                    var valAndSuffixMatch = val.match(/^[+-]?[\d\.]+([a-z]*)$/);
                    if (valAndSuffixMatch && valAndSuffixMatch[1].length == 0) {
                        errorMsg = "Please provide a CSS unit value for " + userProvidedProp + ":" + val;
                    }
                }
            }
            return { error: errorMsg, value: strVal + unit };
        };
        return DomElementSchemaRegistry;
    }(element_schema_registry_1.ElementSchemaRegistry));
    exports.DomElementSchemaRegistry = DomElementSchemaRegistry;
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3NjaGVtYS9kb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILG1EQUFrRztJQUVsRyw2REFBNkQ7SUFDN0QsbURBQTRDO0lBRTVDLHdGQUFzRDtJQUN0RCxnR0FBZ0U7SUFFaEUsSUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDO0lBQzFCLElBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQztJQUN4QixJQUFNLE1BQU0sR0FBRyxRQUFRLENBQUM7SUFDeEIsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDO0lBRXhCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXlDRztJQUVILG9HQUFvRztJQUNwRyxvR0FBb0c7SUFDcEcsb0dBQW9HO0lBQ3BHLG9HQUFvRztJQUNwRyxvR0FBb0c7SUFDcEcsRUFBRTtJQUNGLCtFQUErRTtJQUMvRSxFQUFFO0lBQ0Ysa0dBQWtHO0lBQ2xHLHFFQUFxRTtJQUNyRSxFQUFFO0lBQ0Ysb0dBQW9HO0lBRXBHLElBQU0sTUFBTSxHQUFhO1FBQ3ZCLGdPQUFnTztZQUM1Tiw4Q0FBOEM7WUFDOUMsa0tBQWtLO1FBQ3RLLHExQkFBcTFCO1FBQ3IxQixvZ0NBQW9nQztRQUNwZ0MsK05BQStOO1FBQy9OLDB1QkFBMHVCO1FBQzF1QixzQkFBc0I7UUFDdEIsMENBQTBDO1FBQzFDLHNCQUFzQjtRQUN0Qix1Q0FBdUM7UUFDdkMsc0JBQXNCO1FBQ3RCLGlDQUFpQztRQUNqQyx3Q0FBd0M7UUFDeEMsa0xBQWtMO1FBQ2xMLDZKQUE2SjtRQUM3SixjQUFjO1FBQ2Qsd0JBQXdCO1FBQ3hCLGdDQUFnQztRQUNoQyxnUUFBZ1E7UUFDaFEsd0hBQXdI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LFNBQVMsc0JBQXNCLENBQUMsSUFBWTtRQUMxQyxRQUFRLElBQUksRUFBRTtZQUNaLEtBQUssT0FBTyxDQUFDO1lBQ2IsS0FBSyxRQUFRLENBQUM7WUFDZCxLQUFLLFVBQVUsQ0FBQztZQUNoQixLQUFLLFdBQVcsQ0FBQztZQUNqQixLQUFLLFVBQVUsQ0FBQztZQUNoQixLQUFLLFdBQVcsQ0FBQztZQUNqQixLQUFLLE1BQU0sQ0FBQztZQUNaLEtBQUssS0FBSyxDQUFDO1lBQ1gsS0FBSyxRQUFRLENBQUM7WUFDZCxLQUFLLE9BQU8sQ0FBQztZQUNiLEtBQUssVUFBVSxDQUFDO1lBQ2hCLEtBQUssY0FBYyxDQUFDO1lBQ3BCLEtBQUssZUFBZSxDQUFDO1lBQ3JCLEtBQUssWUFBWSxDQUFDO1lBQ2xCLEtBQUssYUFBYSxDQUFDO1lBQ25CLEtBQUssZUFBZSxDQUFDO1lBQ3JCLEtBQUssY0FBYyxDQUFDO1lBQ3BCLEtBQUssV0FBVyxDQUFDO1lBQ2pCLEtBQUssWUFBWSxDQUFDO1lBQ2xCLEtBQUssY0FBYyxDQUFDO1lBQ3BCLEtBQUssYUFBYSxDQUFDO1lBQ25CLEtBQUssY0FBYyxDQUFDO1lBQ3BCLEtBQUssYUFBYSxDQUFDO1lBQ25CLEtBQUssZ0JBQWdCLENBQUM7WUFDdEIsS0FBSyxpQkFBaUIsQ0FBQztZQUN2QixLQUFLLGtCQUFrQixDQUFDO1lBQ3hCLEtBQUssbUJBQW1CLENBQUM7WUFDekIsS0FBSyxZQUFZO2dCQUNmLE9BQU8sSUFBSSxDQUFDO1lBRWQ7Z0JBQ0UsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q1VTVE9NX0VMRU1FTlRTX1NDSEVNQSwgTk9fRVJST1JTX1NDSEVNQSwgU2NoZW1hTWV0YWRhdGEsIFNlY3VyaXR5Q29udGV4dH0gZnJvbSAnLi4vY29yZSc7XG5cbmltcG9ydCB7aXNOZ0NvbnRhaW5lciwgaXNOZ0NvbnRlbnR9IGZyb20gJy4uL21sX3BhcnNlci90YWdzJztcbmltcG9ydCB7ZGFzaENhc2VUb0NhbWVsQ2FzZX0gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7U0VDVVJJVFlfU0NIRU1BfSBmcm9tICcuL2RvbV9zZWN1cml0eV9zY2hlbWEnO1xuaW1wb3J0IHtFbGVtZW50U2NoZW1hUmVnaXN0cnl9IGZyb20gJy4vZWxlbWVudF9zY2hlbWFfcmVnaXN0cnknO1xuXG5jb25zdCBCT09MRUFOID0gJ2Jvb2xlYW4nO1xuY29uc3QgTlVNQkVSID0gJ251bWJlcic7XG5jb25zdCBTVFJJTkcgPSAnc3RyaW5nJztcbmNvbnN0IE9CSkVDVCA9ICdvYmplY3QnO1xuXG4vKipcbiAqIFRoaXMgYXJyYXkgcmVwcmVzZW50cyB0aGUgRE9NIHNjaGVtYS4gSXQgZW5jb2RlcyBpbmhlcml0YW5jZSwgcHJvcGVydGllcywgYW5kIGV2ZW50cy5cbiAqXG4gKiAjIyBPdmVydmlld1xuICpcbiAqIEVhY2ggbGluZSByZXByZXNlbnRzIG9uZSBraW5kIG9mIGVsZW1lbnQuIFRoZSBgZWxlbWVudF9pbmhlcml0YW5jZWAgYW5kIHByb3BlcnRpZXMgYXJlIGpvaW5lZFxuICogdXNpbmcgYGVsZW1lbnRfaW5oZXJpdGFuY2V8cHJvcGVydGllc2Agc3ludGF4LlxuICpcbiAqICMjIEVsZW1lbnQgSW5oZXJpdGFuY2VcbiAqXG4gKiBUaGUgYGVsZW1lbnRfaW5oZXJpdGFuY2VgIGNhbiBiZSBmdXJ0aGVyIHN1YmRpdmlkZWQgYXMgYGVsZW1lbnQxLGVsZW1lbnQyLC4uLl5wYXJlbnRFbGVtZW50YC5cbiAqIEhlcmUgdGhlIGluZGl2aWR1YWwgZWxlbWVudHMgYXJlIHNlcGFyYXRlZCBieSBgLGAgKGNvbW1hcykuIEV2ZXJ5IGVsZW1lbnQgaW4gdGhlIGxpc3RcbiAqIGhhcyBpZGVudGljYWwgcHJvcGVydGllcy5cbiAqXG4gKiBBbiBgZWxlbWVudGAgbWF5IGluaGVyaXQgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIGZyb20gYHBhcmVudEVsZW1lbnRgIElmIG5vIGBecGFyZW50RWxlbWVudGAgaXNcbiAqIHNwZWNpZmllZCB0aGVuIGBcIlwiYCAoYmxhbmspIGVsZW1lbnQgaXMgYXNzdW1lZC5cbiAqXG4gKiBOT1RFOiBUaGUgYmxhbmsgZWxlbWVudCBpbmhlcml0cyBmcm9tIHJvb3QgYFtFbGVtZW50XWAgZWxlbWVudCwgdGhlIHN1cGVyIGVsZW1lbnQgb2YgYWxsXG4gKiBlbGVtZW50cy5cbiAqXG4gKiBOT1RFIGFuIGVsZW1lbnQgcHJlZml4IHN1Y2ggYXMgYDpzdmc6YCBoYXMgbm8gc3BlY2lhbCBtZWFuaW5nIHRvIHRoZSBzY2hlbWEuXG4gKlxuICogIyMgUHJvcGVydGllc1xuICpcbiAqIEVhY2ggZWxlbWVudCBoYXMgYSBzZXQgb2YgcHJvcGVydGllcyBzZXBhcmF0ZWQgYnkgYCxgIChjb21tYXMpLiBFYWNoIHByb3BlcnR5IGNhbiBiZSBwcmVmaXhlZFxuICogYnkgYSBzcGVjaWFsIGNoYXJhY3RlciBkZXNpZ25hdGluZyBpdHMgdHlwZTpcbiAqXG4gKiAtIChubyBwcmVmaXgpOiBwcm9wZXJ0eSBpcyBhIHN0cmluZy5cbiAqIC0gYCpgOiBwcm9wZXJ0eSByZXByZXNlbnRzIGFuIGV2ZW50LlxuICogLSBgIWA6IHByb3BlcnR5IGlzIGEgYm9vbGVhbi5cbiAqIC0gYCNgOiBwcm9wZXJ0eSBpcyBhIG51bWJlci5cbiAqIC0gYCVgOiBwcm9wZXJ0eSBpcyBhbiBvYmplY3QuXG4gKlxuICogIyMgUXVlcnlcbiAqXG4gKiBUaGUgY2xhc3MgY3JlYXRlcyBhbiBpbnRlcm5hbCBzcXVhcyByZXByZXNlbnRhdGlvbiB3aGljaCBhbGxvd3MgdG8gZWFzaWx5IGFuc3dlciB0aGUgcXVlcnkgb2ZcbiAqIGlmIGEgZ2l2ZW4gcHJvcGVydHkgZXhpc3Qgb24gYSBnaXZlbiBlbGVtZW50LlxuICpcbiAqIE5PVEU6IFdlIGRvbid0IHlldCBzdXBwb3J0IHF1ZXJ5aW5nIGZvciB0eXBlcyBvciBldmVudHMuXG4gKiBOT1RFOiBUaGlzIHNjaGVtYSBpcyBhdXRvIGV4dHJhY3RlZCBmcm9tIGBzY2hlbWFfZXh0cmFjdG9yLnRzYCBsb2NhdGVkIGluIHRoZSB0ZXN0IGZvbGRlcixcbiAqICAgICAgIHNlZSBkb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnlfc3BlYy50c1xuICovXG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vID09PT09PT09PT09IFMgVCBPIFAgICAtICBTIFQgTyBQICAgLSAgUyBUIE8gUCAgIC0gIFMgVCBPIFAgICAtICBTIFQgTyBQICAgLSAgUyBUIE8gUCAgPT09PT09PT09PT1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vXG4vLyAgICAgICAgICAgICAgICAgICAgICAgRE8gTk9UIEVESVQgVEhJUyBET00gU0NIRU1BIFdJVEhPVVQgQSBTRUNVUklUWSBSRVZJRVchXG4vL1xuLy8gTmV3bHkgYWRkZWQgcHJvcGVydGllcyBtdXN0IGJlIHNlY3VyaXR5IHJldmlld2VkIGFuZCBhc3NpZ25lZCBhbiBhcHByb3ByaWF0ZSBTZWN1cml0eUNvbnRleHQgaW5cbi8vIGRvbV9zZWN1cml0eV9zY2hlbWEudHMuIFJlYWNoIG91dCB0byBtcHJvYnN0ICYgcmphbWV0IGZvciBkZXRhaWxzLlxuLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuY29uc3QgU0NIRU1BOiBzdHJpbmdbXSA9IFtcbiAgJ1tFbGVtZW50XXx0ZXh0Q29udGVudCwlY2xhc3NMaXN0LGNsYXNzTmFtZSxpZCxpbm5lckhUTUwsKmJlZm9yZWNvcHksKmJlZm9yZWN1dCwqYmVmb3JlcGFzdGUsKmNvcHksKmN1dCwqcGFzdGUsKnNlYXJjaCwqc2VsZWN0c3RhcnQsKndlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UsKndlYmtpdGZ1bGxzY3JlZW5lcnJvciwqd2hlZWwsb3V0ZXJIVE1MLCNzY3JvbGxMZWZ0LCNzY3JvbGxUb3Asc2xvdCcgK1xuICAgICAgLyogYWRkZWQgbWFudWFsbHkgdG8gYXZvaWQgYnJlYWtpbmcgY2hhbmdlcyAqL1xuICAgICAgJywqbWVzc2FnZSwqbW96ZnVsbHNjcmVlbmNoYW5nZSwqbW96ZnVsbHNjcmVlbmVycm9yLCptb3pwb2ludGVybG9ja2NoYW5nZSwqbW96cG9pbnRlcmxvY2tlcnJvciwqd2ViZ2xjb250ZXh0Y3JlYXRpb25lcnJvciwqd2ViZ2xjb250ZXh0bG9zdCwqd2ViZ2xjb250ZXh0cmVzdG9yZWQnLFxuICAnW0hUTUxFbGVtZW50XV5bRWxlbWVudF18YWNjZXNzS2V5LGNvbnRlbnRFZGl0YWJsZSxkaXIsIWRyYWdnYWJsZSwhaGlkZGVuLGlubmVyVGV4dCxsYW5nLCphYm9ydCwqYXV4Y2xpY2ssKmJsdXIsKmNhbmNlbCwqY2FucGxheSwqY2FucGxheXRocm91Z2gsKmNoYW5nZSwqY2xpY2ssKmNsb3NlLCpjb250ZXh0bWVudSwqY3VlY2hhbmdlLCpkYmxjbGljaywqZHJhZywqZHJhZ2VuZCwqZHJhZ2VudGVyLCpkcmFnbGVhdmUsKmRyYWdvdmVyLCpkcmFnc3RhcnQsKmRyb3AsKmR1cmF0aW9uY2hhbmdlLCplbXB0aWVkLCplbmRlZCwqZXJyb3IsKmZvY3VzLCpnb3Rwb2ludGVyY2FwdHVyZSwqaW5wdXQsKmludmFsaWQsKmtleWRvd24sKmtleXByZXNzLCprZXl1cCwqbG9hZCwqbG9hZGVkZGF0YSwqbG9hZGVkbWV0YWRhdGEsKmxvYWRzdGFydCwqbG9zdHBvaW50ZXJjYXB0dXJlLCptb3VzZWRvd24sKm1vdXNlZW50ZXIsKm1vdXNlbGVhdmUsKm1vdXNlbW92ZSwqbW91c2VvdXQsKm1vdXNlb3ZlciwqbW91c2V1cCwqbW91c2V3aGVlbCwqcGF1c2UsKnBsYXksKnBsYXlpbmcsKnBvaW50ZXJjYW5jZWwsKnBvaW50ZXJkb3duLCpwb2ludGVyZW50ZXIsKnBvaW50ZXJsZWF2ZSwqcG9pbnRlcm1vdmUsKnBvaW50ZXJvdXQsKnBvaW50ZXJvdmVyLCpwb2ludGVydXAsKnByb2dyZXNzLCpyYXRlY2hhbmdlLCpyZXNldCwqcmVzaXplLCpzY3JvbGwsKnNlZWtlZCwqc2Vla2luZywqc2VsZWN0LCpzaG93LCpzdGFsbGVkLCpzdWJtaXQsKnN1c3BlbmQsKnRpbWV1cGRhdGUsKnRvZ2dsZSwqdm9sdW1lY2hhbmdlLCp3YWl0aW5nLG91dGVyVGV4dCwhc3BlbGxjaGVjaywlc3R5bGUsI3RhYkluZGV4LHRpdGxlLCF0cmFuc2xhdGUnLFxuICAnYWJicixhZGRyZXNzLGFydGljbGUsYXNpZGUsYixiZGksYmRvLGNpdGUsY29kZSxkZCxkZm4sZHQsZW0sZmlnY2FwdGlvbixmaWd1cmUsZm9vdGVyLGhlYWRlcixpLGtiZCxtYWluLG1hcmssbmF2LG5vc2NyaXB0LHJiLHJwLHJ0LHJ0YyxydWJ5LHMsc2FtcCxzZWN0aW9uLHNtYWxsLHN0cm9uZyxzdWIsc3VwLHUsdmFyLHdicl5bSFRNTEVsZW1lbnRdfGFjY2Vzc0tleSxjb250ZW50RWRpdGFibGUsZGlyLCFkcmFnZ2FibGUsIWhpZGRlbixpbm5lclRleHQsbGFuZywqYWJvcnQsKmF1eGNsaWNrLCpibHVyLCpjYW5jZWwsKmNhbnBsYXksKmNhbnBsYXl0aHJvdWdoLCpjaGFuZ2UsKmNsaWNrLCpjbG9zZSwqY29udGV4dG1lbnUsKmN1ZWNoYW5nZSwqZGJsY2xpY2ssKmRyYWcsKmRyYWdlbmQsKmRyYWdlbnRlciwqZHJhZ2xlYXZlLCpkcmFnb3ZlciwqZHJhZ3N0YXJ0LCpkcm9wLCpkdXJhdGlvbmNoYW5nZSwqZW1wdGllZCwqZW5kZWQsKmVycm9yLCpmb2N1cywqZ290cG9pbnRlcmNhcHR1cmUsKmlucHV0LCppbnZhbGlkLCprZXlkb3duLCprZXlwcmVzcywqa2V5dXAsKmxvYWQsKmxvYWRlZGRhdGEsKmxvYWRlZG1ldGFkYXRhLCpsb2Fkc3RhcnQsKmxvc3Rwb2ludGVyY2FwdHVyZSwqbW91c2Vkb3duLCptb3VzZWVudGVyLCptb3VzZWxlYXZlLCptb3VzZW1vdmUsKm1vdXNlb3V0LCptb3VzZW92ZXIsKm1vdXNldXAsKm1vdXNld2hlZWwsKnBhdXNlLCpwbGF5LCpwbGF5aW5nLCpwb2ludGVyY2FuY2VsLCpwb2ludGVyZG93biwqcG9pbnRlcmVudGVyLCpwb2ludGVybGVhdmUsKnBvaW50ZXJtb3ZlLCpwb2ludGVyb3V0LCpwb2ludGVyb3ZlciwqcG9pbnRlcnVwLCpwcm9ncmVzcywqcmF0ZWNoYW5nZSwqcmVzZXQsKnJlc2l6ZSwqc2Nyb2xsLCpzZWVrZWQsKnNlZWtpbmcsKnNlbGVjdCwqc2hvdywqc3RhbGxlZCwqc3VibWl0LCpzdXNwZW5kLCp0aW1ldXBkYXRlLCp0b2dnbGUsKnZvbHVtZWNoYW5nZSwqd2FpdGluZyxvdXRlclRleHQsIXNwZWxsY2hlY2ssJXN0eWxlLCN0YWJJbmRleCx0aXRsZSwhdHJhbnNsYXRlJyxcbiAgJ21lZGlhXltIVE1MRWxlbWVudF18IWF1dG9wbGF5LCFjb250cm9scywlY29udHJvbHNMaXN0LCVjcm9zc09yaWdpbiwjY3VycmVudFRpbWUsIWRlZmF1bHRNdXRlZCwjZGVmYXVsdFBsYXliYWNrUmF0ZSwhZGlzYWJsZVJlbW90ZVBsYXliYWNrLCFsb29wLCFtdXRlZCwqZW5jcnlwdGVkLCp3YWl0aW5nZm9ya2V5LCNwbGF5YmFja1JhdGUscHJlbG9hZCxzcmMsJXNyY09iamVjdCwjdm9sdW1lJyxcbiAgJzpzdmc6XltIVE1MRWxlbWVudF18KmFib3J0LCphdXhjbGljaywqYmx1ciwqY2FuY2VsLCpjYW5wbGF5LCpjYW5wbGF5dGhyb3VnaCwqY2hhbmdlLCpjbGljaywqY2xvc2UsKmNvbnRleHRtZW51LCpjdWVjaGFuZ2UsKmRibGNsaWNrLCpkcmFnLCpkcmFnZW5kLCpkcmFnZW50ZXIsKmRyYWdsZWF2ZSwqZHJhZ292ZXIsKmRyYWdzdGFydCwqZHJvcCwqZHVyYXRpb25jaGFuZ2UsKmVtcHRpZWQsKmVuZGVkLCplcnJvciwqZm9jdXMsKmdvdHBvaW50ZXJjYXB0dXJlLCppbnB1dCwqaW52YWxpZCwqa2V5ZG93biwqa2V5cHJlc3MsKmtleXVwLCpsb2FkLCpsb2FkZWRkYXRhLCpsb2FkZWRtZXRhZGF0YSwqbG9hZHN0YXJ0LCpsb3N0cG9pbnRlcmNhcHR1cmUsKm1vdXNlZG93biwqbW91c2VlbnRlciwqbW91c2VsZWF2ZSwqbW91c2Vtb3ZlLCptb3VzZW91dCwqbW91c2VvdmVyLCptb3VzZXVwLCptb3VzZXdoZWVsLCpwYXVzZSwqcGxheSwqcGxheWluZywqcG9pbnRlcmNhbmNlbCwqcG9pbnRlcmRvd24sKnBvaW50ZXJlbnRlciwqcG9pbnRlcmxlYXZlLCpwb2ludGVybW92ZSwqcG9pbnRlcm91dCwqcG9pbnRlcm92ZXIsKnBvaW50ZXJ1cCwqcHJvZ3Jlc3MsKnJhdGVjaGFuZ2UsKnJlc2V0LCpyZXNpemUsKnNjcm9sbCwqc2Vla2VkLCpzZWVraW5nLCpzZWxlY3QsKnNob3csKnN0YWxsZWQsKnN1Ym1pdCwqc3VzcGVuZCwqdGltZXVwZGF0ZSwqdG9nZ2xlLCp2b2x1bWVjaGFuZ2UsKndhaXRpbmcsJXN0eWxlLCN0YWJJbmRleCcsXG4gICc6c3ZnOmdyYXBoaWNzXjpzdmc6fCcsXG4gICc6c3ZnOmFuaW1hdGlvbl46c3ZnOnwqYmVnaW4sKmVuZCwqcmVwZWF0JyxcbiAgJzpzdmc6Z2VvbWV0cnleOnN2Zzp8JyxcbiAgJzpzdmc6Y29tcG9uZW50VHJhbnNmZXJGdW5jdGlvbl46c3ZnOnwnLFxuICAnOnN2ZzpncmFkaWVudF46c3ZnOnwnLFxuICAnOnN2Zzp0ZXh0Q29udGVudF46c3ZnOmdyYXBoaWNzfCcsXG4gICc6c3ZnOnRleHRQb3NpdGlvbmluZ146c3ZnOnRleHRDb250ZW50fCcsXG4gICdhXltIVE1MRWxlbWVudF18Y2hhcnNldCxjb29yZHMsZG93bmxvYWQsaGFzaCxob3N0LGhvc3RuYW1lLGhyZWYsaHJlZmxhbmcsbmFtZSxwYXNzd29yZCxwYXRobmFtZSxwaW5nLHBvcnQscHJvdG9jb2wscmVmZXJyZXJQb2xpY3kscmVsLHJldixzZWFyY2gsc2hhcGUsdGFyZ2V0LHRleHQsdHlwZSx1c2VybmFtZScsXG4gICdhcmVhXltIVE1MRWxlbWVudF18YWx0LGNvb3Jkcyxkb3dubG9hZCxoYXNoLGhvc3QsaG9zdG5hbWUsaHJlZiwhbm9IcmVmLHBhc3N3b3JkLHBhdGhuYW1lLHBpbmcscG9ydCxwcm90b2NvbCxyZWZlcnJlclBvbGljeSxyZWwsc2VhcmNoLHNoYXBlLHRhcmdldCx1c2VybmFtZScsXG4gICdhdWRpb15tZWRpYXwnLFxuICAnYnJeW0hUTUxFbGVtZW50XXxjbGVhcicsXG4gICdiYXNlXltIVE1MRWxlbWVudF18aHJlZix0YXJnZXQnLFxuICAnYm9keV5bSFRNTEVsZW1lbnRdfGFMaW5rLGJhY2tncm91bmQsYmdDb2xvcixsaW5rLCpiZWZvcmV1bmxvYWQsKmJsdXIsKmVycm9yLCpmb2N1cywqaGFzaGNoYW5nZSwqbGFuZ3VhZ2VjaGFuZ2UsKmxvYWQsKm1lc3NhZ2UsKm9mZmxpbmUsKm9ubGluZSwqcGFnZWhpZGUsKnBhZ2VzaG93LCpwb3BzdGF0ZSwqcmVqZWN0aW9uaGFuZGxlZCwqcmVzaXplLCpzY3JvbGwsKnN0b3JhZ2UsKnVuaGFuZGxlZHJlamVjdGlvbiwqdW5sb2FkLHRleHQsdkxpbmsnLFxuICAnYnV0dG9uXltIVE1MRWxlbWVudF18IWF1dG9mb2N1cywhZGlzYWJsZWQsZm9ybUFjdGlvbixmb3JtRW5jdHlwZSxmb3JtTWV0aG9kLCFmb3JtTm9WYWxpZGF0ZSxmb3JtVGFyZ2V0LG5hbWUsdHlwZSx2YWx1ZScsXG4gICdjYW52YXNeW0hUTUxFbGVtZW50XXwjaGVpZ2h0LCN3aWR0aCcsXG4gICdjb250ZW50XltIVE1MRWxlbWVudF18c2VsZWN0JyxcbiAgJ2RsXltIVE1MRWxlbWVudF18IWNvbXBhY3QnLFxuICAnZGF0YWxpc3ReW0hUTUxFbGVtZW50XXwnLFxuICAnZGV0YWlsc15bSFRNTEVsZW1lbnRdfCFvcGVuJyxcbiAgJ2RpYWxvZ15bSFRNTEVsZW1lbnRdfCFvcGVuLHJldHVyblZhbHVlJyxcbiAgJ2Rpcl5bSFRNTEVsZW1lbnRdfCFjb21wYWN0JyxcbiAgJ2Rpdl5bSFRNTEVsZW1lbnRdfGFsaWduJyxcbiAgJ2VtYmVkXltIVE1MRWxlbWVudF18YWxpZ24saGVpZ2h0LG5hbWUsc3JjLHR5cGUsd2lkdGgnLFxuICAnZmllbGRzZXReW0hUTUxFbGVtZW50XXwhZGlzYWJsZWQsbmFtZScsXG4gICdmb250XltIVE1MRWxlbWVudF18Y29sb3IsZmFjZSxzaXplJyxcbiAgJ2Zvcm1eW0hUTUxFbGVtZW50XXxhY2NlcHRDaGFyc2V0LGFjdGlvbixhdXRvY29tcGxldGUsZW5jb2RpbmcsZW5jdHlwZSxtZXRob2QsbmFtZSwhbm9WYWxpZGF0ZSx0YXJnZXQnLFxuICAnZnJhbWVeW0hUTUxFbGVtZW50XXxmcmFtZUJvcmRlcixsb25nRGVzYyxtYXJnaW5IZWlnaHQsbWFyZ2luV2lkdGgsbmFtZSwhbm9SZXNpemUsc2Nyb2xsaW5nLHNyYycsXG4gICdmcmFtZXNldF5bSFRNTEVsZW1lbnRdfGNvbHMsKmJlZm9yZXVubG9hZCwqYmx1ciwqZXJyb3IsKmZvY3VzLCpoYXNoY2hhbmdlLCpsYW5ndWFnZWNoYW5nZSwqbG9hZCwqbWVzc2FnZSwqb2ZmbGluZSwqb25saW5lLCpwYWdlaGlkZSwqcGFnZXNob3csKnBvcHN0YXRlLCpyZWplY3Rpb25oYW5kbGVkLCpyZXNpemUsKnNjcm9sbCwqc3RvcmFnZSwqdW5oYW5kbGVkcmVqZWN0aW9uLCp1bmxvYWQscm93cycsXG4gICdocl5bSFRNTEVsZW1lbnRdfGFsaWduLGNvbG9yLCFub1NoYWRlLHNpemUsd2lkdGgnLFxuICAnaGVhZF5bSFRNTEVsZW1lbnRdfCcsXG4gICdoMSxoMixoMyxoNCxoNSxoNl5bSFRNTEVsZW1lbnRdfGFsaWduJyxcbiAgJ2h0bWxeW0hUTUxFbGVtZW50XXx2ZXJzaW9uJyxcbiAgJ2lmcmFtZV5bSFRNTEVsZW1lbnRdfGFsaWduLCFhbGxvd0Z1bGxzY3JlZW4sZnJhbWVCb3JkZXIsaGVpZ2h0LGxvbmdEZXNjLG1hcmdpbkhlaWdodCxtYXJnaW5XaWR0aCxuYW1lLHJlZmVycmVyUG9saWN5LCVzYW5kYm94LHNjcm9sbGluZyxzcmMsc3JjZG9jLHdpZHRoJyxcbiAgJ2ltZ15bSFRNTEVsZW1lbnRdfGFsaWduLGFsdCxib3JkZXIsJWNyb3NzT3JpZ2luLCNoZWlnaHQsI2hzcGFjZSwhaXNNYXAsbG9uZ0Rlc2MsbG93c3JjLG5hbWUscmVmZXJyZXJQb2xpY3ksc2l6ZXMsc3JjLHNyY3NldCx1c2VNYXAsI3ZzcGFjZSwjd2lkdGgnLFxuICAnaW5wdXReW0hUTUxFbGVtZW50XXxhY2NlcHQsYWxpZ24sYWx0LGF1dG9jYXBpdGFsaXplLGF1dG9jb21wbGV0ZSwhYXV0b2ZvY3VzLCFjaGVja2VkLCFkZWZhdWx0Q2hlY2tlZCxkZWZhdWx0VmFsdWUsZGlyTmFtZSwhZGlzYWJsZWQsJWZpbGVzLGZvcm1BY3Rpb24sZm9ybUVuY3R5cGUsZm9ybU1ldGhvZCwhZm9ybU5vVmFsaWRhdGUsZm9ybVRhcmdldCwjaGVpZ2h0LCFpbmNyZW1lbnRhbCwhaW5kZXRlcm1pbmF0ZSxtYXgsI21heExlbmd0aCxtaW4sI21pbkxlbmd0aCwhbXVsdGlwbGUsbmFtZSxwYXR0ZXJuLHBsYWNlaG9sZGVyLCFyZWFkT25seSwhcmVxdWlyZWQsc2VsZWN0aW9uRGlyZWN0aW9uLCNzZWxlY3Rpb25FbmQsI3NlbGVjdGlvblN0YXJ0LCNzaXplLHNyYyxzdGVwLHR5cGUsdXNlTWFwLHZhbHVlLCV2YWx1ZUFzRGF0ZSwjdmFsdWVBc051bWJlciwjd2lkdGgnLFxuICAnbGleW0hUTUxFbGVtZW50XXx0eXBlLCN2YWx1ZScsXG4gICdsYWJlbF5bSFRNTEVsZW1lbnRdfGh0bWxGb3InLFxuICAnbGVnZW5kXltIVE1MRWxlbWVudF18YWxpZ24nLFxuICAnbGlua15bSFRNTEVsZW1lbnRdfGFzLGNoYXJzZXQsJWNyb3NzT3JpZ2luLCFkaXNhYmxlZCxocmVmLGhyZWZsYW5nLGludGVncml0eSxtZWRpYSxyZWZlcnJlclBvbGljeSxyZWwsJXJlbExpc3QscmV2LCVzaXplcyx0YXJnZXQsdHlwZScsXG4gICdtYXBeW0hUTUxFbGVtZW50XXxuYW1lJyxcbiAgJ21hcnF1ZWVeW0hUTUxFbGVtZW50XXxiZWhhdmlvcixiZ0NvbG9yLGRpcmVjdGlvbixoZWlnaHQsI2hzcGFjZSwjbG9vcCwjc2Nyb2xsQW1vdW50LCNzY3JvbGxEZWxheSwhdHJ1ZVNwZWVkLCN2c3BhY2Usd2lkdGgnLFxuICAnbWVudV5bSFRNTEVsZW1lbnRdfCFjb21wYWN0JyxcbiAgJ21ldGFeW0hUTUxFbGVtZW50XXxjb250ZW50LGh0dHBFcXVpdixuYW1lLHNjaGVtZScsXG4gICdtZXRlcl5bSFRNTEVsZW1lbnRdfCNoaWdoLCNsb3csI21heCwjbWluLCNvcHRpbXVtLCN2YWx1ZScsXG4gICdpbnMsZGVsXltIVE1MRWxlbWVudF18Y2l0ZSxkYXRlVGltZScsXG4gICdvbF5bSFRNTEVsZW1lbnRdfCFjb21wYWN0LCFyZXZlcnNlZCwjc3RhcnQsdHlwZScsXG4gICdvYmplY3ReW0hUTUxFbGVtZW50XXxhbGlnbixhcmNoaXZlLGJvcmRlcixjb2RlLGNvZGVCYXNlLGNvZGVUeXBlLGRhdGEsIWRlY2xhcmUsaGVpZ2h0LCNoc3BhY2UsbmFtZSxzdGFuZGJ5LHR5cGUsdXNlTWFwLCN2c3BhY2Usd2lkdGgnLFxuICAnb3B0Z3JvdXBeW0hUTUxFbGVtZW50XXwhZGlzYWJsZWQsbGFiZWwnLFxuICAnb3B0aW9uXltIVE1MRWxlbWVudF18IWRlZmF1bHRTZWxlY3RlZCwhZGlzYWJsZWQsbGFiZWwsIXNlbGVjdGVkLHRleHQsdmFsdWUnLFxuICAnb3V0cHV0XltIVE1MRWxlbWVudF18ZGVmYXVsdFZhbHVlLCVodG1sRm9yLG5hbWUsdmFsdWUnLFxuICAncF5bSFRNTEVsZW1lbnRdfGFsaWduJyxcbiAgJ3BhcmFtXltIVE1MRWxlbWVudF18bmFtZSx0eXBlLHZhbHVlLHZhbHVlVHlwZScsXG4gICdwaWN0dXJlXltIVE1MRWxlbWVudF18JyxcbiAgJ3ByZV5bSFRNTEVsZW1lbnRdfCN3aWR0aCcsXG4gICdwcm9ncmVzc15bSFRNTEVsZW1lbnRdfCNtYXgsI3ZhbHVlJyxcbiAgJ3EsYmxvY2txdW90ZSxjaXRlXltIVE1MRWxlbWVudF18JyxcbiAgJ3NjcmlwdF5bSFRNTEVsZW1lbnRdfCFhc3luYyxjaGFyc2V0LCVjcm9zc09yaWdpbiwhZGVmZXIsZXZlbnQsaHRtbEZvcixpbnRlZ3JpdHksc3JjLHRleHQsdHlwZScsXG4gICdzZWxlY3ReW0hUTUxFbGVtZW50XXxhdXRvY29tcGxldGUsIWF1dG9mb2N1cywhZGlzYWJsZWQsI2xlbmd0aCwhbXVsdGlwbGUsbmFtZSwhcmVxdWlyZWQsI3NlbGVjdGVkSW5kZXgsI3NpemUsdmFsdWUnLFxuICAnc2hhZG93XltIVE1MRWxlbWVudF18JyxcbiAgJ3Nsb3ReW0hUTUxFbGVtZW50XXxuYW1lJyxcbiAgJ3NvdXJjZV5bSFRNTEVsZW1lbnRdfG1lZGlhLHNpemVzLHNyYyxzcmNzZXQsdHlwZScsXG4gICdzcGFuXltIVE1MRWxlbWVudF18JyxcbiAgJ3N0eWxlXltIVE1MRWxlbWVudF18IWRpc2FibGVkLG1lZGlhLHR5cGUnLFxuICAnY2FwdGlvbl5bSFRNTEVsZW1lbnRdfGFsaWduJyxcbiAgJ3RoLHRkXltIVE1MRWxlbWVudF18YWJicixhbGlnbixheGlzLGJnQ29sb3IsY2gsY2hPZmYsI2NvbFNwYW4saGVhZGVycyxoZWlnaHQsIW5vV3JhcCwjcm93U3BhbixzY29wZSx2QWxpZ24sd2lkdGgnLFxuICAnY29sLGNvbGdyb3VwXltIVE1MRWxlbWVudF18YWxpZ24sY2gsY2hPZmYsI3NwYW4sdkFsaWduLHdpZHRoJyxcbiAgJ3RhYmxlXltIVE1MRWxlbWVudF18YWxpZ24sYmdDb2xvcixib3JkZXIsJWNhcHRpb24sY2VsbFBhZGRpbmcsY2VsbFNwYWNpbmcsZnJhbWUscnVsZXMsc3VtbWFyeSwldEZvb3QsJXRIZWFkLHdpZHRoJyxcbiAgJ3RyXltIVE1MRWxlbWVudF18YWxpZ24sYmdDb2xvcixjaCxjaE9mZix2QWxpZ24nLFxuICAndGZvb3QsdGhlYWQsdGJvZHleW0hUTUxFbGVtZW50XXxhbGlnbixjaCxjaE9mZix2QWxpZ24nLFxuICAndGVtcGxhdGVeW0hUTUxFbGVtZW50XXwnLFxuICAndGV4dGFyZWFeW0hUTUxFbGVtZW50XXxhdXRvY2FwaXRhbGl6ZSxhdXRvY29tcGxldGUsIWF1dG9mb2N1cywjY29scyxkZWZhdWx0VmFsdWUsZGlyTmFtZSwhZGlzYWJsZWQsI21heExlbmd0aCwjbWluTGVuZ3RoLG5hbWUscGxhY2Vob2xkZXIsIXJlYWRPbmx5LCFyZXF1aXJlZCwjcm93cyxzZWxlY3Rpb25EaXJlY3Rpb24sI3NlbGVjdGlvbkVuZCwjc2VsZWN0aW9uU3RhcnQsdmFsdWUsd3JhcCcsXG4gICd0aXRsZV5bSFRNTEVsZW1lbnRdfHRleHQnLFxuICAndHJhY2teW0hUTUxFbGVtZW50XXwhZGVmYXVsdCxraW5kLGxhYmVsLHNyYyxzcmNsYW5nJyxcbiAgJ3VsXltIVE1MRWxlbWVudF18IWNvbXBhY3QsdHlwZScsXG4gICd1bmtub3duXltIVE1MRWxlbWVudF18JyxcbiAgJ3ZpZGVvXm1lZGlhfCNoZWlnaHQscG9zdGVyLCN3aWR0aCcsXG4gICc6c3ZnOmFeOnN2ZzpncmFwaGljc3wnLFxuICAnOnN2ZzphbmltYXRlXjpzdmc6YW5pbWF0aW9ufCcsXG4gICc6c3ZnOmFuaW1hdGVNb3Rpb25eOnN2ZzphbmltYXRpb258JyxcbiAgJzpzdmc6YW5pbWF0ZVRyYW5zZm9ybV46c3ZnOmFuaW1hdGlvbnwnLFxuICAnOnN2ZzpjaXJjbGVeOnN2ZzpnZW9tZXRyeXwnLFxuICAnOnN2ZzpjbGlwUGF0aF46c3ZnOmdyYXBoaWNzfCcsXG4gICc6c3ZnOmRlZnNeOnN2ZzpncmFwaGljc3wnLFxuICAnOnN2ZzpkZXNjXjpzdmc6fCcsXG4gICc6c3ZnOmRpc2NhcmReOnN2Zzp8JyxcbiAgJzpzdmc6ZWxsaXBzZV46c3ZnOmdlb21ldHJ5fCcsXG4gICc6c3ZnOmZlQmxlbmReOnN2Zzp8JyxcbiAgJzpzdmc6ZmVDb2xvck1hdHJpeF46c3ZnOnwnLFxuICAnOnN2ZzpmZUNvbXBvbmVudFRyYW5zZmVyXjpzdmc6fCcsXG4gICc6c3ZnOmZlQ29tcG9zaXRlXjpzdmc6fCcsXG4gICc6c3ZnOmZlQ29udm9sdmVNYXRyaXheOnN2Zzp8JyxcbiAgJzpzdmc6ZmVEaWZmdXNlTGlnaHRpbmdeOnN2Zzp8JyxcbiAgJzpzdmc6ZmVEaXNwbGFjZW1lbnRNYXBeOnN2Zzp8JyxcbiAgJzpzdmc6ZmVEaXN0YW50TGlnaHReOnN2Zzp8JyxcbiAgJzpzdmc6ZmVEcm9wU2hhZG93Xjpzdmc6fCcsXG4gICc6c3ZnOmZlRmxvb2ReOnN2Zzp8JyxcbiAgJzpzdmc6ZmVGdW5jQV46c3ZnOmNvbXBvbmVudFRyYW5zZmVyRnVuY3Rpb258JyxcbiAgJzpzdmc6ZmVGdW5jQl46c3ZnOmNvbXBvbmVudFRyYW5zZmVyRnVuY3Rpb258JyxcbiAgJzpzdmc6ZmVGdW5jR146c3ZnOmNvbXBvbmVudFRyYW5zZmVyRnVuY3Rpb258JyxcbiAgJzpzdmc6ZmVGdW5jUl46c3ZnOmNvbXBvbmVudFRyYW5zZmVyRnVuY3Rpb258JyxcbiAgJzpzdmc6ZmVHYXVzc2lhbkJsdXJeOnN2Zzp8JyxcbiAgJzpzdmc6ZmVJbWFnZV46c3ZnOnwnLFxuICAnOnN2ZzpmZU1lcmdlXjpzdmc6fCcsXG4gICc6c3ZnOmZlTWVyZ2VOb2RlXjpzdmc6fCcsXG4gICc6c3ZnOmZlTW9ycGhvbG9neV46c3ZnOnwnLFxuICAnOnN2ZzpmZU9mZnNldF46c3ZnOnwnLFxuICAnOnN2ZzpmZVBvaW50TGlnaHReOnN2Zzp8JyxcbiAgJzpzdmc6ZmVTcGVjdWxhckxpZ2h0aW5nXjpzdmc6fCcsXG4gICc6c3ZnOmZlU3BvdExpZ2h0Xjpzdmc6fCcsXG4gICc6c3ZnOmZlVGlsZV46c3ZnOnwnLFxuICAnOnN2ZzpmZVR1cmJ1bGVuY2VeOnN2Zzp8JyxcbiAgJzpzdmc6ZmlsdGVyXjpzdmc6fCcsXG4gICc6c3ZnOmZvcmVpZ25PYmplY3ReOnN2ZzpncmFwaGljc3wnLFxuICAnOnN2ZzpnXjpzdmc6Z3JhcGhpY3N8JyxcbiAgJzpzdmc6aW1hZ2VeOnN2ZzpncmFwaGljc3wnLFxuICAnOnN2ZzpsaW5lXjpzdmc6Z2VvbWV0cnl8JyxcbiAgJzpzdmc6bGluZWFyR3JhZGllbnReOnN2ZzpncmFkaWVudHwnLFxuICAnOnN2ZzptcGF0aF46c3ZnOnwnLFxuICAnOnN2ZzptYXJrZXJeOnN2Zzp8JyxcbiAgJzpzdmc6bWFza146c3ZnOnwnLFxuICAnOnN2ZzptZXRhZGF0YV46c3ZnOnwnLFxuICAnOnN2ZzpwYXRoXjpzdmc6Z2VvbWV0cnl8JyxcbiAgJzpzdmc6cGF0dGVybl46c3ZnOnwnLFxuICAnOnN2Zzpwb2x5Z29uXjpzdmc6Z2VvbWV0cnl8JyxcbiAgJzpzdmc6cG9seWxpbmVeOnN2ZzpnZW9tZXRyeXwnLFxuICAnOnN2ZzpyYWRpYWxHcmFkaWVudF46c3ZnOmdyYWRpZW50fCcsXG4gICc6c3ZnOnJlY3ReOnN2ZzpnZW9tZXRyeXwnLFxuICAnOnN2ZzpzdmdeOnN2ZzpncmFwaGljc3wjY3VycmVudFNjYWxlLCN6b29tQW5kUGFuJyxcbiAgJzpzdmc6c2NyaXB0Xjpzdmc6fHR5cGUnLFxuICAnOnN2ZzpzZXReOnN2ZzphbmltYXRpb258JyxcbiAgJzpzdmc6c3RvcF46c3ZnOnwnLFxuICAnOnN2ZzpzdHlsZV46c3ZnOnwhZGlzYWJsZWQsbWVkaWEsdGl0bGUsdHlwZScsXG4gICc6c3ZnOnN3aXRjaF46c3ZnOmdyYXBoaWNzfCcsXG4gICc6c3ZnOnN5bWJvbF46c3ZnOnwnLFxuICAnOnN2Zzp0c3Bhbl46c3ZnOnRleHRQb3NpdGlvbmluZ3wnLFxuICAnOnN2Zzp0ZXh0Xjpzdmc6dGV4dFBvc2l0aW9uaW5nfCcsXG4gICc6c3ZnOnRleHRQYXRoXjpzdmc6dGV4dENvbnRlbnR8JyxcbiAgJzpzdmc6dGl0bGVeOnN2Zzp8JyxcbiAgJzpzdmc6dXNlXjpzdmc6Z3JhcGhpY3N8JyxcbiAgJzpzdmc6dmlld146c3ZnOnwjem9vbUFuZFBhbicsXG4gICdkYXRhXltIVE1MRWxlbWVudF18dmFsdWUnLFxuICAna2V5Z2VuXltIVE1MRWxlbWVudF18IWF1dG9mb2N1cyxjaGFsbGVuZ2UsIWRpc2FibGVkLGZvcm0sa2V5dHlwZSxuYW1lJyxcbiAgJ21lbnVpdGVtXltIVE1MRWxlbWVudF18dHlwZSxsYWJlbCxpY29uLCFkaXNhYmxlZCwhY2hlY2tlZCxyYWRpb2dyb3VwLCFkZWZhdWx0JyxcbiAgJ3N1bW1hcnleW0hUTUxFbGVtZW50XXwnLFxuICAndGltZV5bSFRNTEVsZW1lbnRdfGRhdGVUaW1lJyxcbiAgJzpzdmc6Y3Vyc29yXjpzdmc6fCcsXG5dO1xuXG5jb25zdCBfQVRUUl9UT19QUk9QOiB7W25hbWU6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICdjbGFzcyc6ICdjbGFzc05hbWUnLFxuICAnZm9yJzogJ2h0bWxGb3InLFxuICAnZm9ybWFjdGlvbic6ICdmb3JtQWN0aW9uJyxcbiAgJ2lubmVySHRtbCc6ICdpbm5lckhUTUwnLFxuICAncmVhZG9ubHknOiAncmVhZE9ubHknLFxuICAndGFiaW5kZXgnOiAndGFiSW5kZXgnLFxufTtcblxuLy8gSW52ZXJ0IF9BVFRSX1RPX1BST1AuXG5jb25zdCBfUFJPUF9UT19BVFRSOiB7W25hbWU6IHN0cmluZ106IHN0cmluZ30gPVxuICAgIE9iamVjdC5rZXlzKF9BVFRSX1RPX1BST1ApLnJlZHVjZSgoaW52ZXJ0ZWQsIGF0dHIpID0+IHtcbiAgICAgIGludmVydGVkW19BVFRSX1RPX1BST1BbYXR0cl1dID0gYXR0cjtcbiAgICAgIHJldHVybiBpbnZlcnRlZDtcbiAgICB9LCB7fSBhcyB7W3Byb3A6IHN0cmluZ106IHN0cmluZ30pO1xuXG5leHBvcnQgY2xhc3MgRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5IGV4dGVuZHMgRWxlbWVudFNjaGVtYVJlZ2lzdHJ5IHtcbiAgcHJpdmF0ZSBfc2NoZW1hOiB7W2VsZW1lbnQ6IHN0cmluZ106IHtbcHJvcGVydHk6IHN0cmluZ106IHN0cmluZ319ID0ge307XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICBTQ0hFTUEuZm9yRWFjaChlbmNvZGVkVHlwZSA9PiB7XG4gICAgICBjb25zdCB0eXBlOiB7W3Byb3BlcnR5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgICBjb25zdCBbc3RyVHlwZSwgc3RyUHJvcGVydGllc10gPSBlbmNvZGVkVHlwZS5zcGxpdCgnfCcpO1xuICAgICAgY29uc3QgcHJvcGVydGllcyA9IHN0clByb3BlcnRpZXMuc3BsaXQoJywnKTtcbiAgICAgIGNvbnN0IFt0eXBlTmFtZXMsIHN1cGVyTmFtZV0gPSBzdHJUeXBlLnNwbGl0KCdeJyk7XG4gICAgICB0eXBlTmFtZXMuc3BsaXQoJywnKS5mb3JFYWNoKHRhZyA9PiB0aGlzLl9zY2hlbWFbdGFnLnRvTG93ZXJDYXNlKCldID0gdHlwZSk7XG4gICAgICBjb25zdCBzdXBlclR5cGUgPSBzdXBlck5hbWUgJiYgdGhpcy5fc2NoZW1hW3N1cGVyTmFtZS50b0xvd2VyQ2FzZSgpXTtcbiAgICAgIGlmIChzdXBlclR5cGUpIHtcbiAgICAgICAgT2JqZWN0LmtleXMoc3VwZXJUeXBlKS5mb3JFYWNoKChwcm9wOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICB0eXBlW3Byb3BdID0gc3VwZXJUeXBlW3Byb3BdO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHByb3BlcnRpZXMuZm9yRWFjaCgocHJvcGVydHk6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAocHJvcGVydHkubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHN3aXRjaCAocHJvcGVydHlbMF0pIHtcbiAgICAgICAgICAgIGNhc2UgJyonOlxuICAgICAgICAgICAgICAvLyBXZSBkb24ndCB5ZXQgc3VwcG9ydCBldmVudHMuXG4gICAgICAgICAgICAgIC8vIElmIGV2ZXIgYWxsb3dpbmcgdG8gYmluZCB0byBldmVudHMsIEdPIFRIUk9VR0ggQSBTRUNVUklUWSBSRVZJRVcsIGFsbG93aW5nIGV2ZW50c1xuICAgICAgICAgICAgICAvLyB3aWxsXG4gICAgICAgICAgICAgIC8vIGFsbW9zdCBjZXJ0YWlubHkgaW50cm9kdWNlIGJhZCBYU1MgdnVsbmVyYWJpbGl0aWVzLlxuICAgICAgICAgICAgICAvLyB0eXBlW3Byb3BlcnR5LnN1YnN0cmluZygxKV0gPSBFVkVOVDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICchJzpcbiAgICAgICAgICAgICAgdHlwZVtwcm9wZXJ0eS5zdWJzdHJpbmcoMSldID0gQk9PTEVBTjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICcjJzpcbiAgICAgICAgICAgICAgdHlwZVtwcm9wZXJ0eS5zdWJzdHJpbmcoMSldID0gTlVNQkVSO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJyUnOlxuICAgICAgICAgICAgICB0eXBlW3Byb3BlcnR5LnN1YnN0cmluZygxKV0gPSBPQkpFQ1Q7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgdHlwZVtwcm9wZXJ0eV0gPSBTVFJJTkc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGhhc1Byb3BlcnR5KHRhZ05hbWU6IHN0cmluZywgcHJvcE5hbWU6IHN0cmluZywgc2NoZW1hTWV0YXM6IFNjaGVtYU1ldGFkYXRhW10pOiBib29sZWFuIHtcbiAgICBpZiAoc2NoZW1hTWV0YXMuc29tZSgoc2NoZW1hKSA9PiBzY2hlbWEubmFtZSA9PT0gTk9fRVJST1JTX1NDSEVNQS5uYW1lKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHRhZ05hbWUuaW5kZXhPZignLScpID4gLTEpIHtcbiAgICAgIGlmIChpc05nQ29udGFpbmVyKHRhZ05hbWUpIHx8IGlzTmdDb250ZW50KHRhZ05hbWUpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNjaGVtYU1ldGFzLnNvbWUoKHNjaGVtYSkgPT4gc2NoZW1hLm5hbWUgPT09IENVU1RPTV9FTEVNRU5UU19TQ0hFTUEubmFtZSkpIHtcbiAgICAgICAgLy8gQ2FuJ3QgdGVsbCBub3cgYXMgd2UgZG9uJ3Qga25vdyB3aGljaCBwcm9wZXJ0aWVzIGEgY3VzdG9tIGVsZW1lbnQgd2lsbCBnZXRcbiAgICAgICAgLy8gb25jZSBpdCBpcyBpbnN0YW50aWF0ZWRcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZWxlbWVudFByb3BlcnRpZXMgPSB0aGlzLl9zY2hlbWFbdGFnTmFtZS50b0xvd2VyQ2FzZSgpXSB8fCB0aGlzLl9zY2hlbWFbJ3Vua25vd24nXTtcbiAgICByZXR1cm4gISFlbGVtZW50UHJvcGVydGllc1twcm9wTmFtZV07XG4gIH1cblxuICBoYXNFbGVtZW50KHRhZ05hbWU6IHN0cmluZywgc2NoZW1hTWV0YXM6IFNjaGVtYU1ldGFkYXRhW10pOiBib29sZWFuIHtcbiAgICBpZiAoc2NoZW1hTWV0YXMuc29tZSgoc2NoZW1hKSA9PiBzY2hlbWEubmFtZSA9PT0gTk9fRVJST1JTX1NDSEVNQS5uYW1lKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHRhZ05hbWUuaW5kZXhPZignLScpID4gLTEpIHtcbiAgICAgIGlmIChpc05nQ29udGFpbmVyKHRhZ05hbWUpIHx8IGlzTmdDb250ZW50KHRhZ05hbWUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2NoZW1hTWV0YXMuc29tZSgoc2NoZW1hKSA9PiBzY2hlbWEubmFtZSA9PT0gQ1VTVE9NX0VMRU1FTlRTX1NDSEVNQS5uYW1lKSkge1xuICAgICAgICAvLyBBbGxvdyBhbnkgY3VzdG9tIGVsZW1lbnRzXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAhIXRoaXMuX3NjaGVtYVt0YWdOYW1lLnRvTG93ZXJDYXNlKCldO1xuICB9XG5cbiAgLyoqXG4gICAqIHNlY3VyaXR5Q29udGV4dCByZXR1cm5zIHRoZSBzZWN1cml0eSBjb250ZXh0IGZvciB0aGUgZ2l2ZW4gcHJvcGVydHkgb24gdGhlIGdpdmVuIERPTSB0YWcuXG4gICAqXG4gICAqIFRhZyBhbmQgcHJvcGVydHkgbmFtZSBhcmUgc3RhdGljYWxseSBrbm93biBhbmQgY2Fubm90IGNoYW5nZSBhdCBydW50aW1lLCBpLmUuIGl0IGlzIG5vdFxuICAgKiBwb3NzaWJsZSB0byBiaW5kIGEgdmFsdWUgaW50byBhIGNoYW5naW5nIGF0dHJpYnV0ZSBvciB0YWcgbmFtZS5cbiAgICpcbiAgICogVGhlIGZpbHRlcmluZyBpcyBiYXNlZCBvbiBhIGxpc3Qgb2YgYWxsb3dlZCB0YWdzfGF0dHJpYnV0ZXMuIEFsbCBhdHRyaWJ1dGVzIGluIHRoZSBzY2hlbWFcbiAgICogYWJvdmUgYXJlIGFzc3VtZWQgdG8gaGF2ZSB0aGUgJ05PTkUnIHNlY3VyaXR5IGNvbnRleHQsIGkuZS4gdGhhdCB0aGV5IGFyZSBzYWZlIGluZXJ0XG4gICAqIHN0cmluZyB2YWx1ZXMuIE9ubHkgc3BlY2lmaWMgd2VsbCBrbm93biBhdHRhY2sgdmVjdG9ycyBhcmUgYXNzaWduZWQgdGhlaXIgYXBwcm9wcmlhdGUgY29udGV4dC5cbiAgICovXG4gIHNlY3VyaXR5Q29udGV4dCh0YWdOYW1lOiBzdHJpbmcsIHByb3BOYW1lOiBzdHJpbmcsIGlzQXR0cmlidXRlOiBib29sZWFuKTogU2VjdXJpdHlDb250ZXh0IHtcbiAgICBpZiAoaXNBdHRyaWJ1dGUpIHtcbiAgICAgIC8vIE5COiBGb3Igc2VjdXJpdHkgcHVycG9zZXMsIHVzZSB0aGUgbWFwcGVkIHByb3BlcnR5IG5hbWUsIG5vdCB0aGUgYXR0cmlidXRlIG5hbWUuXG4gICAgICBwcm9wTmFtZSA9IHRoaXMuZ2V0TWFwcGVkUHJvcE5hbWUocHJvcE5hbWUpO1xuICAgIH1cblxuICAgIC8vIE1ha2Ugc3VyZSBjb21wYXJpc29ucyBhcmUgY2FzZSBpbnNlbnNpdGl2ZSwgc28gdGhhdCBjYXNlIGRpZmZlcmVuY2VzIGJldHdlZW4gYXR0cmlidXRlIGFuZFxuICAgIC8vIHByb3BlcnR5IG5hbWVzIGRvIG5vdCBoYXZlIGEgc2VjdXJpdHkgaW1wYWN0LlxuICAgIHRhZ05hbWUgPSB0YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgcHJvcE5hbWUgPSBwcm9wTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIGxldCBjdHggPSBTRUNVUklUWV9TQ0hFTUEoKVt0YWdOYW1lICsgJ3wnICsgcHJvcE5hbWVdO1xuICAgIGlmIChjdHgpIHtcbiAgICAgIHJldHVybiBjdHg7XG4gICAgfVxuICAgIGN0eCA9IFNFQ1VSSVRZX1NDSEVNQSgpWycqfCcgKyBwcm9wTmFtZV07XG4gICAgcmV0dXJuIGN0eCA/IGN0eCA6IFNlY3VyaXR5Q29udGV4dC5OT05FO1xuICB9XG5cbiAgZ2V0TWFwcGVkUHJvcE5hbWUocHJvcE5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIF9BVFRSX1RPX1BST1BbcHJvcE5hbWVdIHx8IHByb3BOYW1lO1xuICB9XG5cbiAgZ2V0RGVmYXVsdENvbXBvbmVudEVsZW1lbnROYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICduZy1jb21wb25lbnQnO1xuICB9XG5cbiAgdmFsaWRhdGVQcm9wZXJ0eShuYW1lOiBzdHJpbmcpOiB7ZXJyb3I6IGJvb2xlYW4sIG1zZz86IHN0cmluZ30ge1xuICAgIGlmIChuYW1lLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCgnb24nKSkge1xuICAgICAgY29uc3QgbXNnID0gYEJpbmRpbmcgdG8gZXZlbnQgcHJvcGVydHkgJyR7bmFtZX0nIGlzIGRpc2FsbG93ZWQgZm9yIHNlY3VyaXR5IHJlYXNvbnMsIGAgK1xuICAgICAgICAgIGBwbGVhc2UgdXNlICgke25hbWUuc2xpY2UoMil9KT0uLi5gICtcbiAgICAgICAgICBgXFxuSWYgJyR7bmFtZX0nIGlzIGEgZGlyZWN0aXZlIGlucHV0LCBtYWtlIHN1cmUgdGhlIGRpcmVjdGl2ZSBpcyBpbXBvcnRlZCBieSB0aGVgICtcbiAgICAgICAgICBgIGN1cnJlbnQgbW9kdWxlLmA7XG4gICAgICByZXR1cm4ge2Vycm9yOiB0cnVlLCBtc2c6IG1zZ307XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7ZXJyb3I6IGZhbHNlfTtcbiAgICB9XG4gIH1cblxuICB2YWxpZGF0ZUF0dHJpYnV0ZShuYW1lOiBzdHJpbmcpOiB7ZXJyb3I6IGJvb2xlYW4sIG1zZz86IHN0cmluZ30ge1xuICAgIGlmIChuYW1lLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCgnb24nKSkge1xuICAgICAgY29uc3QgbXNnID0gYEJpbmRpbmcgdG8gZXZlbnQgYXR0cmlidXRlICcke25hbWV9JyBpcyBkaXNhbGxvd2VkIGZvciBzZWN1cml0eSByZWFzb25zLCBgICtcbiAgICAgICAgICBgcGxlYXNlIHVzZSAoJHtuYW1lLnNsaWNlKDIpfSk9Li4uYDtcbiAgICAgIHJldHVybiB7ZXJyb3I6IHRydWUsIG1zZzogbXNnfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtlcnJvcjogZmFsc2V9O1xuICAgIH1cbiAgfVxuXG4gIGFsbEtub3duRWxlbWVudE5hbWVzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fc2NoZW1hKTtcbiAgfVxuXG4gIGFsbEtub3duQXR0cmlidXRlc09mRWxlbWVudCh0YWdOYW1lOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgZWxlbWVudFByb3BlcnRpZXMgPSB0aGlzLl9zY2hlbWFbdGFnTmFtZS50b0xvd2VyQ2FzZSgpXSB8fCB0aGlzLl9zY2hlbWFbJ3Vua25vd24nXTtcbiAgICAvLyBDb252ZXJ0IHByb3BlcnRpZXMgdG8gYXR0cmlidXRlcy5cbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZWxlbWVudFByb3BlcnRpZXMpLm1hcChwcm9wID0+IF9QUk9QX1RPX0FUVFJbcHJvcF0gPz8gcHJvcCk7XG4gIH1cblxuICBub3JtYWxpemVBbmltYXRpb25TdHlsZVByb3BlcnR5KHByb3BOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBkYXNoQ2FzZVRvQ2FtZWxDYXNlKHByb3BOYW1lKTtcbiAgfVxuXG4gIG5vcm1hbGl6ZUFuaW1hdGlvblN0eWxlVmFsdWUoY2FtZWxDYXNlUHJvcDogc3RyaW5nLCB1c2VyUHJvdmlkZWRQcm9wOiBzdHJpbmcsIHZhbDogc3RyaW5nfG51bWJlcik6XG4gICAgICB7ZXJyb3I6IHN0cmluZywgdmFsdWU6IHN0cmluZ30ge1xuICAgIGxldCB1bml0OiBzdHJpbmcgPSAnJztcbiAgICBjb25zdCBzdHJWYWwgPSB2YWwudG9TdHJpbmcoKS50cmltKCk7XG4gICAgbGV0IGVycm9yTXNnOiBzdHJpbmcgPSBudWxsITtcblxuICAgIGlmIChfaXNQaXhlbERpbWVuc2lvblN0eWxlKGNhbWVsQ2FzZVByb3ApICYmIHZhbCAhPT0gMCAmJiB2YWwgIT09ICcwJykge1xuICAgICAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHVuaXQgPSAncHgnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgdmFsQW5kU3VmZml4TWF0Y2ggPSB2YWwubWF0Y2goL15bKy1dP1tcXGRcXC5dKyhbYS16XSopJC8pO1xuICAgICAgICBpZiAodmFsQW5kU3VmZml4TWF0Y2ggJiYgdmFsQW5kU3VmZml4TWF0Y2hbMV0ubGVuZ3RoID09IDApIHtcbiAgICAgICAgICBlcnJvck1zZyA9IGBQbGVhc2UgcHJvdmlkZSBhIENTUyB1bml0IHZhbHVlIGZvciAke3VzZXJQcm92aWRlZFByb3B9OiR7dmFsfWA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtlcnJvcjogZXJyb3JNc2csIHZhbHVlOiBzdHJWYWwgKyB1bml0fTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfaXNQaXhlbERpbWVuc2lvblN0eWxlKHByb3A6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBzd2l0Y2ggKHByb3ApIHtcbiAgICBjYXNlICd3aWR0aCc6XG4gICAgY2FzZSAnaGVpZ2h0JzpcbiAgICBjYXNlICdtaW5XaWR0aCc6XG4gICAgY2FzZSAnbWluSGVpZ2h0JzpcbiAgICBjYXNlICdtYXhXaWR0aCc6XG4gICAgY2FzZSAnbWF4SGVpZ2h0JzpcbiAgICBjYXNlICdsZWZ0JzpcbiAgICBjYXNlICd0b3AnOlxuICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgY2FzZSAncmlnaHQnOlxuICAgIGNhc2UgJ2ZvbnRTaXplJzpcbiAgICBjYXNlICdvdXRsaW5lV2lkdGgnOlxuICAgIGNhc2UgJ291dGxpbmVPZmZzZXQnOlxuICAgIGNhc2UgJ3BhZGRpbmdUb3AnOlxuICAgIGNhc2UgJ3BhZGRpbmdMZWZ0JzpcbiAgICBjYXNlICdwYWRkaW5nQm90dG9tJzpcbiAgICBjYXNlICdwYWRkaW5nUmlnaHQnOlxuICAgIGNhc2UgJ21hcmdpblRvcCc6XG4gICAgY2FzZSAnbWFyZ2luTGVmdCc6XG4gICAgY2FzZSAnbWFyZ2luQm90dG9tJzpcbiAgICBjYXNlICdtYXJnaW5SaWdodCc6XG4gICAgY2FzZSAnYm9yZGVyUmFkaXVzJzpcbiAgICBjYXNlICdib3JkZXJXaWR0aCc6XG4gICAgY2FzZSAnYm9yZGVyVG9wV2lkdGgnOlxuICAgIGNhc2UgJ2JvcmRlckxlZnRXaWR0aCc6XG4gICAgY2FzZSAnYm9yZGVyUmlnaHRXaWR0aCc6XG4gICAgY2FzZSAnYm9yZGVyQm90dG9tV2lkdGgnOlxuICAgIGNhc2UgJ3RleHRJbmRlbnQnOlxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=
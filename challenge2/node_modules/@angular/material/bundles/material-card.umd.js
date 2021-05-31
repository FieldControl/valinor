(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/platform-browser/animations'), require('@angular/material/core')) :
    typeof define === 'function' && define.amd ? define('@angular/material/card', ['exports', '@angular/core', '@angular/platform-browser/animations', '@angular/material/core'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.card = {}), global.ng.core, global.ng.platformBrowser.animations, global.ng.material.core));
}(this, (function (exports, core, animations, core$1) { 'use strict';

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Content of a card, needed as it's used as a selector in the API.
     * @docs-private
     */
    var MatCardContent = /** @class */ (function () {
        function MatCardContent() {
        }
        return MatCardContent;
    }());
    MatCardContent.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-card-content, [mat-card-content], [matCardContent]',
                    host: { 'class': 'mat-card-content' }
                },] }
    ];
    /**
     * Title of a card, needed as it's used as a selector in the API.
     * @docs-private
     */
    var MatCardTitle = /** @class */ (function () {
        function MatCardTitle() {
        }
        return MatCardTitle;
    }());
    MatCardTitle.decorators = [
        { type: core.Directive, args: [{
                    selector: "mat-card-title, [mat-card-title], [matCardTitle]",
                    host: {
                        'class': 'mat-card-title'
                    }
                },] }
    ];
    /**
     * Sub-title of a card, needed as it's used as a selector in the API.
     * @docs-private
     */
    var MatCardSubtitle = /** @class */ (function () {
        function MatCardSubtitle() {
        }
        return MatCardSubtitle;
    }());
    MatCardSubtitle.decorators = [
        { type: core.Directive, args: [{
                    selector: "mat-card-subtitle, [mat-card-subtitle], [matCardSubtitle]",
                    host: {
                        'class': 'mat-card-subtitle'
                    }
                },] }
    ];
    /**
     * Action section of a card, needed as it's used as a selector in the API.
     * @docs-private
     */
    var MatCardActions = /** @class */ (function () {
        function MatCardActions() {
            /** Position of the actions inside the card. */
            this.align = 'start';
        }
        return MatCardActions;
    }());
    MatCardActions.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-card-actions',
                    exportAs: 'matCardActions',
                    host: {
                        'class': 'mat-card-actions',
                        '[class.mat-card-actions-align-end]': 'align === "end"',
                    }
                },] }
    ];
    MatCardActions.propDecorators = {
        align: [{ type: core.Input }]
    };
    /**
     * Footer of a card, needed as it's used as a selector in the API.
     * @docs-private
     */
    var MatCardFooter = /** @class */ (function () {
        function MatCardFooter() {
        }
        return MatCardFooter;
    }());
    MatCardFooter.decorators = [
        { type: core.Directive, args: [{
                    selector: 'mat-card-footer',
                    host: { 'class': 'mat-card-footer' }
                },] }
    ];
    /**
     * Image used in a card, needed to add the mat- CSS styling.
     * @docs-private
     */
    var MatCardImage = /** @class */ (function () {
        function MatCardImage() {
        }
        return MatCardImage;
    }());
    MatCardImage.decorators = [
        { type: core.Directive, args: [{
                    selector: '[mat-card-image], [matCardImage]',
                    host: { 'class': 'mat-card-image' }
                },] }
    ];
    /**
     * Image used in a card, needed to add the mat- CSS styling.
     * @docs-private
     */
    var MatCardSmImage = /** @class */ (function () {
        function MatCardSmImage() {
        }
        return MatCardSmImage;
    }());
    MatCardSmImage.decorators = [
        { type: core.Directive, args: [{
                    selector: '[mat-card-sm-image], [matCardImageSmall]',
                    host: { 'class': 'mat-card-sm-image' }
                },] }
    ];
    /**
     * Image used in a card, needed to add the mat- CSS styling.
     * @docs-private
     */
    var MatCardMdImage = /** @class */ (function () {
        function MatCardMdImage() {
        }
        return MatCardMdImage;
    }());
    MatCardMdImage.decorators = [
        { type: core.Directive, args: [{
                    selector: '[mat-card-md-image], [matCardImageMedium]',
                    host: { 'class': 'mat-card-md-image' }
                },] }
    ];
    /**
     * Image used in a card, needed to add the mat- CSS styling.
     * @docs-private
     */
    var MatCardLgImage = /** @class */ (function () {
        function MatCardLgImage() {
        }
        return MatCardLgImage;
    }());
    MatCardLgImage.decorators = [
        { type: core.Directive, args: [{
                    selector: '[mat-card-lg-image], [matCardImageLarge]',
                    host: { 'class': 'mat-card-lg-image' }
                },] }
    ];
    /**
     * Large image used in a card, needed to add the mat- CSS styling.
     * @docs-private
     */
    var MatCardXlImage = /** @class */ (function () {
        function MatCardXlImage() {
        }
        return MatCardXlImage;
    }());
    MatCardXlImage.decorators = [
        { type: core.Directive, args: [{
                    selector: '[mat-card-xl-image], [matCardImageXLarge]',
                    host: { 'class': 'mat-card-xl-image' }
                },] }
    ];
    /**
     * Avatar image used in a card, needed to add the mat- CSS styling.
     * @docs-private
     */
    var MatCardAvatar = /** @class */ (function () {
        function MatCardAvatar() {
        }
        return MatCardAvatar;
    }());
    MatCardAvatar.decorators = [
        { type: core.Directive, args: [{
                    selector: '[mat-card-avatar], [matCardAvatar]',
                    host: { 'class': 'mat-card-avatar' }
                },] }
    ];
    /**
     * A basic content container component that adds the styles of a Material design card.
     *
     * While this component can be used alone, it also provides a number
     * of preset styles for common card sections, including:
     * - mat-card-title
     * - mat-card-subtitle
     * - mat-card-content
     * - mat-card-actions
     * - mat-card-footer
     */
    var MatCard = /** @class */ (function () {
        // @breaking-change 9.0.0 `_animationMode` parameter to be made required.
        function MatCard(_animationMode) {
            this._animationMode = _animationMode;
        }
        return MatCard;
    }());
    MatCard.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-card',
                    exportAs: 'matCard',
                    template: "<ng-content></ng-content>\n<ng-content select=\"mat-card-footer\"></ng-content>\n",
                    encapsulation: core.ViewEncapsulation.None,
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    host: {
                        'class': 'mat-card mat-focus-indicator',
                        '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
                    },
                    styles: [".mat-card{transition:box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);display:block;position:relative;padding:16px;border-radius:4px}._mat-animation-noopable.mat-card{transition:none;animation:none}.mat-card .mat-divider-horizontal{position:absolute;left:0;width:100%}[dir=rtl] .mat-card .mat-divider-horizontal{left:auto;right:0}.mat-card .mat-divider-horizontal.mat-divider-inset{position:static;margin:0}[dir=rtl] .mat-card .mat-divider-horizontal.mat-divider-inset{margin-right:0}.cdk-high-contrast-active .mat-card{outline:solid 1px}.mat-card-actions,.mat-card-subtitle,.mat-card-content{display:block;margin-bottom:16px}.mat-card-title{display:block;margin-bottom:8px}.mat-card-actions{margin-left:-8px;margin-right:-8px;padding:8px 0}.mat-card-actions-align-end{display:flex;justify-content:flex-end}.mat-card-image{width:calc(100% + 32px);margin:0 -16px 16px -16px}.mat-card-footer{display:block;margin:0 -16px -16px -16px}.mat-card-actions .mat-button,.mat-card-actions .mat-raised-button,.mat-card-actions .mat-stroked-button{margin:0 8px}.mat-card-header{display:flex;flex-direction:row}.mat-card-header .mat-card-title{margin-bottom:12px}.mat-card-header-text{margin:0 16px}.mat-card-avatar{height:40px;width:40px;border-radius:50%;flex-shrink:0;object-fit:cover}.mat-card-title-group{display:flex;justify-content:space-between}.mat-card-sm-image{width:80px;height:80px}.mat-card-md-image{width:112px;height:112px}.mat-card-lg-image{width:152px;height:152px}.mat-card-xl-image{width:240px;height:240px;margin:-8px}.mat-card-title-group>.mat-card-xl-image{margin:-8px 0 8px}@media(max-width: 599px){.mat-card-title-group{margin:0}.mat-card-xl-image{margin-left:0;margin-right:0}}.mat-card>:first-child,.mat-card-content>:first-child{margin-top:0}.mat-card>:last-child:not(.mat-card-footer),.mat-card-content>:last-child:not(.mat-card-footer){margin-bottom:0}.mat-card-image:first-child{margin-top:-16px;border-top-left-radius:inherit;border-top-right-radius:inherit}.mat-card>.mat-card-actions:last-child{margin-bottom:-8px;padding-bottom:0}.mat-card-actions:not(.mat-card-actions-align-end) .mat-button:first-child,.mat-card-actions:not(.mat-card-actions-align-end) .mat-raised-button:first-child,.mat-card-actions:not(.mat-card-actions-align-end) .mat-stroked-button:first-child{margin-left:0;margin-right:0}.mat-card-actions-align-end .mat-button:last-child,.mat-card-actions-align-end .mat-raised-button:last-child,.mat-card-actions-align-end .mat-stroked-button:last-child{margin-left:0;margin-right:0}.mat-card-title:not(:first-child),.mat-card-subtitle:not(:first-child){margin-top:-4px}.mat-card-header .mat-card-subtitle:not(:first-child){margin-top:-8px}.mat-card>.mat-card-xl-image:first-child{margin-top:-8px}.mat-card>.mat-card-xl-image:last-child{margin-bottom:-8px}\n"]
                },] }
    ];
    MatCard.ctorParameters = function () { return [
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [animations.ANIMATION_MODULE_TYPE,] }] }
    ]; };
    /**
     * Component intended to be used within the `<mat-card>` component. It adds styles for a
     * preset header section (i.e. a title, subtitle, and avatar layout).
     * @docs-private
     */
    var MatCardHeader = /** @class */ (function () {
        function MatCardHeader() {
        }
        return MatCardHeader;
    }());
    MatCardHeader.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-card-header',
                    template: "<ng-content select=\"[mat-card-avatar], [matCardAvatar]\"></ng-content>\n<div class=\"mat-card-header-text\">\n  <ng-content\n      select=\"mat-card-title, mat-card-subtitle,\n      [mat-card-title], [mat-card-subtitle],\n      [matCardTitle], [matCardSubtitle]\"></ng-content>\n</div>\n<ng-content></ng-content>\n",
                    encapsulation: core.ViewEncapsulation.None,
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    host: { 'class': 'mat-card-header' }
                },] }
    ];
    /**
     * Component intended to be used within the `<mat-card>` component. It adds styles for a preset
     * layout that groups an image with a title section.
     * @docs-private
     */
    var MatCardTitleGroup = /** @class */ (function () {
        function MatCardTitleGroup() {
        }
        return MatCardTitleGroup;
    }());
    MatCardTitleGroup.decorators = [
        { type: core.Component, args: [{
                    selector: 'mat-card-title-group',
                    template: "<div>\n  <ng-content\n      select=\"mat-card-title, mat-card-subtitle,\n      [mat-card-title], [mat-card-subtitle],\n      [matCardTitle], [matCardSubtitle]\"></ng-content>\n</div>\n<ng-content select=\"img\"></ng-content>\n<ng-content></ng-content>\n",
                    encapsulation: core.ViewEncapsulation.None,
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    host: { 'class': 'mat-card-title-group' }
                },] }
    ];

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatCardModule = /** @class */ (function () {
        function MatCardModule() {
        }
        return MatCardModule;
    }());
    MatCardModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [core$1.MatCommonModule],
                    exports: [
                        MatCard,
                        MatCardHeader,
                        MatCardTitleGroup,
                        MatCardContent,
                        MatCardTitle,
                        MatCardSubtitle,
                        MatCardActions,
                        MatCardFooter,
                        MatCardSmImage,
                        MatCardMdImage,
                        MatCardLgImage,
                        MatCardImage,
                        MatCardXlImage,
                        MatCardAvatar,
                        core$1.MatCommonModule,
                    ],
                    declarations: [
                        MatCard, MatCardHeader, MatCardTitleGroup, MatCardContent, MatCardTitle, MatCardSubtitle,
                        MatCardActions, MatCardFooter, MatCardSmImage, MatCardMdImage, MatCardLgImage, MatCardImage,
                        MatCardXlImage, MatCardAvatar,
                    ],
                },] }
    ];

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.MatCard = MatCard;
    exports.MatCardActions = MatCardActions;
    exports.MatCardAvatar = MatCardAvatar;
    exports.MatCardContent = MatCardContent;
    exports.MatCardFooter = MatCardFooter;
    exports.MatCardHeader = MatCardHeader;
    exports.MatCardImage = MatCardImage;
    exports.MatCardLgImage = MatCardLgImage;
    exports.MatCardMdImage = MatCardMdImage;
    exports.MatCardModule = MatCardModule;
    exports.MatCardSmImage = MatCardSmImage;
    exports.MatCardSubtitle = MatCardSubtitle;
    exports.MatCardTitle = MatCardTitle;
    exports.MatCardTitleGroup = MatCardTitleGroup;
    exports.MatCardXlImage = MatCardXlImage;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-card.umd.js.map

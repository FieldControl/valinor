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
import * as ɵngcc0 from '@angular/core';
export declare class MatCardContent {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatCardContent, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatCardContent, "mat-card-content, [mat-card-content], [matCardContent]", never, {}, {}, never>;
}
/**
 * Title of a card, needed as it's used as a selector in the API.
 * @docs-private
 */
export declare class MatCardTitle {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatCardTitle, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatCardTitle, "mat-card-title, [mat-card-title], [matCardTitle]", never, {}, {}, never>;
}
/**
 * Sub-title of a card, needed as it's used as a selector in the API.
 * @docs-private
 */
export declare class MatCardSubtitle {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatCardSubtitle, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatCardSubtitle, "mat-card-subtitle, [mat-card-subtitle], [matCardSubtitle]", never, {}, {}, never>;
}
/**
 * Action section of a card, needed as it's used as a selector in the API.
 * @docs-private
 */
export declare class MatCardActions {
    /** Position of the actions inside the card. */
    align: 'start' | 'end';
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatCardActions, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatCardActions, "mat-card-actions", ["matCardActions"], { "align": "align"; }, {}, never>;
}
/**
 * Footer of a card, needed as it's used as a selector in the API.
 * @docs-private
 */
export declare class MatCardFooter {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatCardFooter, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatCardFooter, "mat-card-footer", never, {}, {}, never>;
}
/**
 * Image used in a card, needed to add the mat- CSS styling.
 * @docs-private
 */
export declare class MatCardImage {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatCardImage, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatCardImage, "[mat-card-image], [matCardImage]", never, {}, {}, never>;
}
/**
 * Image used in a card, needed to add the mat- CSS styling.
 * @docs-private
 */
export declare class MatCardSmImage {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatCardSmImage, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatCardSmImage, "[mat-card-sm-image], [matCardImageSmall]", never, {}, {}, never>;
}
/**
 * Image used in a card, needed to add the mat- CSS styling.
 * @docs-private
 */
export declare class MatCardMdImage {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatCardMdImage, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatCardMdImage, "[mat-card-md-image], [matCardImageMedium]", never, {}, {}, never>;
}
/**
 * Image used in a card, needed to add the mat- CSS styling.
 * @docs-private
 */
export declare class MatCardLgImage {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatCardLgImage, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatCardLgImage, "[mat-card-lg-image], [matCardImageLarge]", never, {}, {}, never>;
}
/**
 * Large image used in a card, needed to add the mat- CSS styling.
 * @docs-private
 */
export declare class MatCardXlImage {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatCardXlImage, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatCardXlImage, "[mat-card-xl-image], [matCardImageXLarge]", never, {}, {}, never>;
}
/**
 * Avatar image used in a card, needed to add the mat- CSS styling.
 * @docs-private
 */
export declare class MatCardAvatar {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatCardAvatar, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatCardAvatar, "[mat-card-avatar], [matCardAvatar]", never, {}, {}, never>;
}
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
export declare class MatCard {
    _animationMode?: string | undefined;
    constructor(_animationMode?: string | undefined);
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatCard, [{ optional: true; }]>;
    static ɵcmp: ɵngcc0.ɵɵComponentDeclaration<MatCard, "mat-card", ["matCard"], {}, {}, never, ["*", "mat-card-footer"]>;
}
/**
 * Component intended to be used within the `<mat-card>` component. It adds styles for a
 * preset header section (i.e. a title, subtitle, and avatar layout).
 * @docs-private
 */
export declare class MatCardHeader {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatCardHeader, never>;
    static ɵcmp: ɵngcc0.ɵɵComponentDeclaration<MatCardHeader, "mat-card-header", never, {}, {}, never, ["[mat-card-avatar], [matCardAvatar]", "mat-card-title, mat-card-subtitle,\n      [mat-card-title], [mat-card-subtitle],\n      [matCardTitle], [matCardSubtitle]", "*"]>;
}
/**
 * Component intended to be used within the `<mat-card>` component. It adds styles for a preset
 * layout that groups an image with a title section.
 * @docs-private
 */
export declare class MatCardTitleGroup {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatCardTitleGroup, never>;
    static ɵcmp: ɵngcc0.ɵɵComponentDeclaration<MatCardTitleGroup, "mat-card-title-group", never, {}, {}, never, ["mat-card-title, mat-card-subtitle,\n      [mat-card-title], [mat-card-subtitle],\n      [matCardTitle], [matCardSubtitle]", "img", "*"]>;
}

//# sourceMappingURL=card.d.ts.map
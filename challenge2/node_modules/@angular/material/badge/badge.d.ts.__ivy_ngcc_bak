/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AriaDescriber } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { ElementRef, NgZone, OnChanges, OnDestroy, Renderer2, SimpleChanges } from '@angular/core';
import { CanDisable, CanDisableCtor, ThemePalette } from '@angular/material/core';
/** @docs-private */
declare class MatBadgeBase {
}
declare const _MatBadgeMixinBase: CanDisableCtor & typeof MatBadgeBase;
/** Allowed position options for matBadgePosition */
export declare type MatBadgePosition = 'above after' | 'above before' | 'below before' | 'below after' | 'before' | 'after' | 'above' | 'below';
/** Allowed size options for matBadgeSize */
export declare type MatBadgeSize = 'small' | 'medium' | 'large';
/** Directive to display a text badge. */
export declare class MatBadge extends _MatBadgeMixinBase implements OnDestroy, OnChanges, CanDisable {
    private _ngZone;
    private _elementRef;
    private _ariaDescriber;
    private _renderer;
    private _animationMode?;
    /** Whether the badge has any content. */
    _hasContent: boolean;
    /** The color of the badge. Can be `primary`, `accent`, or `warn`. */
    get color(): ThemePalette;
    set color(value: ThemePalette);
    private _color;
    /** Whether the badge should overlap its contents or not */
    get overlap(): boolean;
    set overlap(val: boolean);
    private _overlap;
    /**
     * Position the badge should reside.
     * Accepts any combination of 'above'|'below' and 'before'|'after'
     */
    position: MatBadgePosition;
    /** The content for the badge */
    content: string | number | undefined | null;
    /** Message used to describe the decorated element via aria-describedby */
    get description(): string;
    set description(newDescription: string);
    private _description;
    /** Size of the badge. Can be 'small', 'medium', or 'large'. */
    size: MatBadgeSize;
    /** Whether the badge is hidden. */
    get hidden(): boolean;
    set hidden(val: boolean);
    private _hidden;
    /** Unique id for the badge */
    _id: number;
    private _badgeElement;
    constructor(_ngZone: NgZone, _elementRef: ElementRef<HTMLElement>, _ariaDescriber: AriaDescriber, _renderer: Renderer2, _animationMode?: string | undefined);
    /** Whether the badge is above the host or not */
    isAbove(): boolean;
    /** Whether the badge is after the host or not */
    isAfter(): boolean;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    /**
     * Gets the element into which the badge's content is being rendered.
     * Undefined if the element hasn't been created (e.g. if the badge doesn't have content).
     */
    getBadgeElement(): HTMLElement | undefined;
    /** Injects a span element into the DOM with the content. */
    private _updateTextContent;
    /** Creates the badge element */
    private _createBadgeElement;
    /** Sets the aria-label property on the element */
    private _updateHostAriaDescription;
    /** Adds css theme class given the color to the component host */
    private _setColor;
    /** Clears any existing badges that might be left over from server-side rendering. */
    private _clearExistingBadges;
    /** Gets the string representation of the badge content. */
    private _stringifyContent;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_hidden: BooleanInput;
    static ngAcceptInputType_overlap: BooleanInput;
}
export {};

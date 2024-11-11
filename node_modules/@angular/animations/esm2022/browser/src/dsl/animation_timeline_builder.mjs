/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { AnimationMetadataType, AUTO_STYLE, ɵPRE_STYLE as PRE_STYLE, } from '@angular/animations';
import { invalidQuery } from '../error_helpers';
import { interpolateParams, resolveTiming, resolveTimingValue, visitDslNode } from '../util';
import { createTimelineInstruction, } from './animation_timeline_instruction';
import { ElementInstructionMap } from './element_instruction_map';
const ONE_FRAME_IN_MILLISECONDS = 1;
const ENTER_TOKEN = ':enter';
const ENTER_TOKEN_REGEX = new RegExp(ENTER_TOKEN, 'g');
const LEAVE_TOKEN = ':leave';
const LEAVE_TOKEN_REGEX = new RegExp(LEAVE_TOKEN, 'g');
/*
 * The code within this file aims to generate web-animations-compatible keyframes from Angular's
 * animation DSL code.
 *
 * The code below will be converted from:
 *
 * ```
 * sequence([
 *   style({ opacity: 0 }),
 *   animate(1000, style({ opacity: 0 }))
 * ])
 * ```
 *
 * To:
 * ```
 * keyframes = [{ opacity: 0, offset: 0 }, { opacity: 1, offset: 1 }]
 * duration = 1000
 * delay = 0
 * easing = ''
 * ```
 *
 * For this operation to cover the combination of animation verbs (style, animate, group, etc...) a
 * combination of AST traversal and merge-sort-like algorithms are used.
 *
 * [AST Traversal]
 * Each of the animation verbs, when executed, will return an string-map object representing what
 * type of action it is (style, animate, group, etc...) and the data associated with it. This means
 * that when functional composition mix of these functions is evaluated (like in the example above)
 * then it will end up producing a tree of objects representing the animation itself.
 *
 * When this animation object tree is processed by the visitor code below it will visit each of the
 * verb statements within the visitor. And during each visit it will build the context of the
 * animation keyframes by interacting with the `TimelineBuilder`.
 *
 * [TimelineBuilder]
 * This class is responsible for tracking the styles and building a series of keyframe objects for a
 * timeline between a start and end time. The builder starts off with an initial timeline and each
 * time the AST comes across a `group()`, `keyframes()` or a combination of the two within a
 * `sequence()` then it will generate a sub timeline for each step as well as a new one after
 * they are complete.
 *
 * As the AST is traversed, the timing state on each of the timelines will be incremented. If a sub
 * timeline was created (based on one of the cases above) then the parent timeline will attempt to
 * merge the styles used within the sub timelines into itself (only with group() this will happen).
 * This happens with a merge operation (much like how the merge works in mergeSort) and it will only
 * copy the most recently used styles from the sub timelines into the parent timeline. This ensures
 * that if the styles are used later on in another phase of the animation then they will be the most
 * up-to-date values.
 *
 * [How Missing Styles Are Updated]
 * Each timeline has a `backFill` property which is responsible for filling in new styles into
 * already processed keyframes if a new style shows up later within the animation sequence.
 *
 * ```
 * sequence([
 *   style({ width: 0 }),
 *   animate(1000, style({ width: 100 })),
 *   animate(1000, style({ width: 200 })),
 *   animate(1000, style({ width: 300 }))
 *   animate(1000, style({ width: 400, height: 400 })) // notice how `height` doesn't exist anywhere
 * else
 * ])
 * ```
 *
 * What is happening here is that the `height` value is added later in the sequence, but is missing
 * from all previous animation steps. Therefore when a keyframe is created it would also be missing
 * from all previous keyframes up until where it is first used. For the timeline keyframe generation
 * to properly fill in the style it will place the previous value (the value from the parent
 * timeline) or a default value of `*` into the backFill map.
 *
 * When a sub-timeline is created it will have its own backFill property. This is done so that
 * styles present within the sub-timeline do not accidentally seep into the previous/future timeline
 * keyframes
 *
 * [Validation]
 * The code in this file is not responsible for validation. That functionality happens with within
 * the `AnimationValidatorVisitor` code.
 */
export function buildAnimationTimelines(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles = new Map(), finalStyles = new Map(), options, subInstructions, errors = []) {
    return new AnimationTimelineBuilderVisitor().buildKeyframes(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles, finalStyles, options, subInstructions, errors);
}
export class AnimationTimelineBuilderVisitor {
    buildKeyframes(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles, finalStyles, options, subInstructions, errors = []) {
        subInstructions = subInstructions || new ElementInstructionMap();
        const context = new AnimationTimelineContext(driver, rootElement, subInstructions, enterClassName, leaveClassName, errors, []);
        context.options = options;
        const delay = options.delay ? resolveTimingValue(options.delay) : 0;
        context.currentTimeline.delayNextStep(delay);
        context.currentTimeline.setStyles([startingStyles], null, context.errors, options);
        visitDslNode(this, ast, context);
        // this checks to see if an actual animation happened
        const timelines = context.timelines.filter((timeline) => timeline.containsAnimation());
        // note: we just want to apply the final styles for the rootElement, so we do not
        //       just apply the styles to the last timeline but the last timeline which
        //       element is the root one (basically `*`-styles are replaced with the actual
        //       state style values only for the root element)
        if (timelines.length && finalStyles.size) {
            let lastRootTimeline;
            for (let i = timelines.length - 1; i >= 0; i--) {
                const timeline = timelines[i];
                if (timeline.element === rootElement) {
                    lastRootTimeline = timeline;
                    break;
                }
            }
            if (lastRootTimeline && !lastRootTimeline.allowOnlyTimelineStyles()) {
                lastRootTimeline.setStyles([finalStyles], null, context.errors, options);
            }
        }
        return timelines.length
            ? timelines.map((timeline) => timeline.buildKeyframes())
            : [createTimelineInstruction(rootElement, [], [], [], 0, delay, '', false)];
    }
    visitTrigger(ast, context) {
        // these values are not visited in this AST
    }
    visitState(ast, context) {
        // these values are not visited in this AST
    }
    visitTransition(ast, context) {
        // these values are not visited in this AST
    }
    visitAnimateChild(ast, context) {
        const elementInstructions = context.subInstructions.get(context.element);
        if (elementInstructions) {
            const innerContext = context.createSubContext(ast.options);
            const startTime = context.currentTimeline.currentTime;
            const endTime = this._visitSubInstructions(elementInstructions, innerContext, innerContext.options);
            if (startTime != endTime) {
                // we do this on the upper context because we created a sub context for
                // the sub child animations
                context.transformIntoNewTimeline(endTime);
            }
        }
        context.previousNode = ast;
    }
    visitAnimateRef(ast, context) {
        const innerContext = context.createSubContext(ast.options);
        innerContext.transformIntoNewTimeline();
        this._applyAnimationRefDelays([ast.options, ast.animation.options], context, innerContext);
        this.visitReference(ast.animation, innerContext);
        context.transformIntoNewTimeline(innerContext.currentTimeline.currentTime);
        context.previousNode = ast;
    }
    _applyAnimationRefDelays(animationsRefsOptions, context, innerContext) {
        for (const animationRefOptions of animationsRefsOptions) {
            const animationDelay = animationRefOptions?.delay;
            if (animationDelay) {
                const animationDelayValue = typeof animationDelay === 'number'
                    ? animationDelay
                    : resolveTimingValue(interpolateParams(animationDelay, animationRefOptions?.params ?? {}, context.errors));
                innerContext.delayNextStep(animationDelayValue);
            }
        }
    }
    _visitSubInstructions(instructions, context, options) {
        const startTime = context.currentTimeline.currentTime;
        let furthestTime = startTime;
        // this is a special-case for when a user wants to skip a sub
        // animation from being fired entirely.
        const duration = options.duration != null ? resolveTimingValue(options.duration) : null;
        const delay = options.delay != null ? resolveTimingValue(options.delay) : null;
        if (duration !== 0) {
            instructions.forEach((instruction) => {
                const instructionTimings = context.appendInstructionToTimeline(instruction, duration, delay);
                furthestTime = Math.max(furthestTime, instructionTimings.duration + instructionTimings.delay);
            });
        }
        return furthestTime;
    }
    visitReference(ast, context) {
        context.updateOptions(ast.options, true);
        visitDslNode(this, ast.animation, context);
        context.previousNode = ast;
    }
    visitSequence(ast, context) {
        const subContextCount = context.subContextCount;
        let ctx = context;
        const options = ast.options;
        if (options && (options.params || options.delay)) {
            ctx = context.createSubContext(options);
            ctx.transformIntoNewTimeline();
            if (options.delay != null) {
                if (ctx.previousNode.type == AnimationMetadataType.Style) {
                    ctx.currentTimeline.snapshotCurrentStyles();
                    ctx.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
                }
                const delay = resolveTimingValue(options.delay);
                ctx.delayNextStep(delay);
            }
        }
        if (ast.steps.length) {
            ast.steps.forEach((s) => visitDslNode(this, s, ctx));
            // this is here just in case the inner steps only contain or end with a style() call
            ctx.currentTimeline.applyStylesToKeyframe();
            // this means that some animation function within the sequence
            // ended up creating a sub timeline (which means the current
            // timeline cannot overlap with the contents of the sequence)
            if (ctx.subContextCount > subContextCount) {
                ctx.transformIntoNewTimeline();
            }
        }
        context.previousNode = ast;
    }
    visitGroup(ast, context) {
        const innerTimelines = [];
        let furthestTime = context.currentTimeline.currentTime;
        const delay = ast.options && ast.options.delay ? resolveTimingValue(ast.options.delay) : 0;
        ast.steps.forEach((s) => {
            const innerContext = context.createSubContext(ast.options);
            if (delay) {
                innerContext.delayNextStep(delay);
            }
            visitDslNode(this, s, innerContext);
            furthestTime = Math.max(furthestTime, innerContext.currentTimeline.currentTime);
            innerTimelines.push(innerContext.currentTimeline);
        });
        // this operation is run after the AST loop because otherwise
        // if the parent timeline's collected styles were updated then
        // it would pass in invalid data into the new-to-be forked items
        innerTimelines.forEach((timeline) => context.currentTimeline.mergeTimelineCollectedStyles(timeline));
        context.transformIntoNewTimeline(furthestTime);
        context.previousNode = ast;
    }
    _visitTiming(ast, context) {
        if (ast.dynamic) {
            const strValue = ast.strValue;
            const timingValue = context.params
                ? interpolateParams(strValue, context.params, context.errors)
                : strValue;
            return resolveTiming(timingValue, context.errors);
        }
        else {
            return { duration: ast.duration, delay: ast.delay, easing: ast.easing };
        }
    }
    visitAnimate(ast, context) {
        const timings = (context.currentAnimateTimings = this._visitTiming(ast.timings, context));
        const timeline = context.currentTimeline;
        if (timings.delay) {
            context.incrementTime(timings.delay);
            timeline.snapshotCurrentStyles();
        }
        const style = ast.style;
        if (style.type == AnimationMetadataType.Keyframes) {
            this.visitKeyframes(style, context);
        }
        else {
            context.incrementTime(timings.duration);
            this.visitStyle(style, context);
            timeline.applyStylesToKeyframe();
        }
        context.currentAnimateTimings = null;
        context.previousNode = ast;
    }
    visitStyle(ast, context) {
        const timeline = context.currentTimeline;
        const timings = context.currentAnimateTimings;
        // this is a special case for when a style() call
        // directly follows  an animate() call (but not inside of an animate() call)
        if (!timings && timeline.hasCurrentStyleProperties()) {
            timeline.forwardFrame();
        }
        const easing = (timings && timings.easing) || ast.easing;
        if (ast.isEmptyStep) {
            timeline.applyEmptyStep(easing);
        }
        else {
            timeline.setStyles(ast.styles, easing, context.errors, context.options);
        }
        context.previousNode = ast;
    }
    visitKeyframes(ast, context) {
        const currentAnimateTimings = context.currentAnimateTimings;
        const startTime = context.currentTimeline.duration;
        const duration = currentAnimateTimings.duration;
        const innerContext = context.createSubContext();
        const innerTimeline = innerContext.currentTimeline;
        innerTimeline.easing = currentAnimateTimings.easing;
        ast.styles.forEach((step) => {
            const offset = step.offset || 0;
            innerTimeline.forwardTime(offset * duration);
            innerTimeline.setStyles(step.styles, step.easing, context.errors, context.options);
            innerTimeline.applyStylesToKeyframe();
        });
        // this will ensure that the parent timeline gets all the styles from
        // the child even if the new timeline below is not used
        context.currentTimeline.mergeTimelineCollectedStyles(innerTimeline);
        // we do this because the window between this timeline and the sub timeline
        // should ensure that the styles within are exactly the same as they were before
        context.transformIntoNewTimeline(startTime + duration);
        context.previousNode = ast;
    }
    visitQuery(ast, context) {
        // in the event that the first step before this is a style step we need
        // to ensure the styles are applied before the children are animated
        const startTime = context.currentTimeline.currentTime;
        const options = (ast.options || {});
        const delay = options.delay ? resolveTimingValue(options.delay) : 0;
        if (delay &&
            (context.previousNode.type === AnimationMetadataType.Style ||
                (startTime == 0 && context.currentTimeline.hasCurrentStyleProperties()))) {
            context.currentTimeline.snapshotCurrentStyles();
            context.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
        }
        let furthestTime = startTime;
        const elms = context.invokeQuery(ast.selector, ast.originalSelector, ast.limit, ast.includeSelf, options.optional ? true : false, context.errors);
        context.currentQueryTotal = elms.length;
        let sameElementTimeline = null;
        elms.forEach((element, i) => {
            context.currentQueryIndex = i;
            const innerContext = context.createSubContext(ast.options, element);
            if (delay) {
                innerContext.delayNextStep(delay);
            }
            if (element === context.element) {
                sameElementTimeline = innerContext.currentTimeline;
            }
            visitDslNode(this, ast.animation, innerContext);
            // this is here just incase the inner steps only contain or end
            // with a style() call (which is here to signal that this is a preparatory
            // call to style an element before it is animated again)
            innerContext.currentTimeline.applyStylesToKeyframe();
            const endTime = innerContext.currentTimeline.currentTime;
            furthestTime = Math.max(furthestTime, endTime);
        });
        context.currentQueryIndex = 0;
        context.currentQueryTotal = 0;
        context.transformIntoNewTimeline(furthestTime);
        if (sameElementTimeline) {
            context.currentTimeline.mergeTimelineCollectedStyles(sameElementTimeline);
            context.currentTimeline.snapshotCurrentStyles();
        }
        context.previousNode = ast;
    }
    visitStagger(ast, context) {
        const parentContext = context.parentContext;
        const tl = context.currentTimeline;
        const timings = ast.timings;
        const duration = Math.abs(timings.duration);
        const maxTime = duration * (context.currentQueryTotal - 1);
        let delay = duration * context.currentQueryIndex;
        let staggerTransformer = timings.duration < 0 ? 'reverse' : timings.easing;
        switch (staggerTransformer) {
            case 'reverse':
                delay = maxTime - delay;
                break;
            case 'full':
                delay = parentContext.currentStaggerTime;
                break;
        }
        const timeline = context.currentTimeline;
        if (delay) {
            timeline.delayNextStep(delay);
        }
        const startingTime = timeline.currentTime;
        visitDslNode(this, ast.animation, context);
        context.previousNode = ast;
        // time = duration + delay
        // the reason why this computation is so complex is because
        // the inner timeline may either have a delay value or a stretched
        // keyframe depending on if a subtimeline is not used or is used.
        parentContext.currentStaggerTime =
            tl.currentTime - startingTime + (tl.startTime - parentContext.currentTimeline.startTime);
    }
}
const DEFAULT_NOOP_PREVIOUS_NODE = {};
export class AnimationTimelineContext {
    constructor(_driver, element, subInstructions, _enterClassName, _leaveClassName, errors, timelines, initialTimeline) {
        this._driver = _driver;
        this.element = element;
        this.subInstructions = subInstructions;
        this._enterClassName = _enterClassName;
        this._leaveClassName = _leaveClassName;
        this.errors = errors;
        this.timelines = timelines;
        this.parentContext = null;
        this.currentAnimateTimings = null;
        this.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
        this.subContextCount = 0;
        this.options = {};
        this.currentQueryIndex = 0;
        this.currentQueryTotal = 0;
        this.currentStaggerTime = 0;
        this.currentTimeline = initialTimeline || new TimelineBuilder(this._driver, element, 0);
        timelines.push(this.currentTimeline);
    }
    get params() {
        return this.options.params;
    }
    updateOptions(options, skipIfExists) {
        if (!options)
            return;
        const newOptions = options;
        let optionsToUpdate = this.options;
        // NOTE: this will get patched up when other animation methods support duration overrides
        if (newOptions.duration != null) {
            optionsToUpdate.duration = resolveTimingValue(newOptions.duration);
        }
        if (newOptions.delay != null) {
            optionsToUpdate.delay = resolveTimingValue(newOptions.delay);
        }
        const newParams = newOptions.params;
        if (newParams) {
            let paramsToUpdate = optionsToUpdate.params;
            if (!paramsToUpdate) {
                paramsToUpdate = this.options.params = {};
            }
            Object.keys(newParams).forEach((name) => {
                if (!skipIfExists || !paramsToUpdate.hasOwnProperty(name)) {
                    paramsToUpdate[name] = interpolateParams(newParams[name], paramsToUpdate, this.errors);
                }
            });
        }
    }
    _copyOptions() {
        const options = {};
        if (this.options) {
            const oldParams = this.options.params;
            if (oldParams) {
                const params = (options['params'] = {});
                Object.keys(oldParams).forEach((name) => {
                    params[name] = oldParams[name];
                });
            }
        }
        return options;
    }
    createSubContext(options = null, element, newTime) {
        const target = element || this.element;
        const context = new AnimationTimelineContext(this._driver, target, this.subInstructions, this._enterClassName, this._leaveClassName, this.errors, this.timelines, this.currentTimeline.fork(target, newTime || 0));
        context.previousNode = this.previousNode;
        context.currentAnimateTimings = this.currentAnimateTimings;
        context.options = this._copyOptions();
        context.updateOptions(options);
        context.currentQueryIndex = this.currentQueryIndex;
        context.currentQueryTotal = this.currentQueryTotal;
        context.parentContext = this;
        this.subContextCount++;
        return context;
    }
    transformIntoNewTimeline(newTime) {
        this.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
        this.currentTimeline = this.currentTimeline.fork(this.element, newTime);
        this.timelines.push(this.currentTimeline);
        return this.currentTimeline;
    }
    appendInstructionToTimeline(instruction, duration, delay) {
        const updatedTimings = {
            duration: duration != null ? duration : instruction.duration,
            delay: this.currentTimeline.currentTime + (delay != null ? delay : 0) + instruction.delay,
            easing: '',
        };
        const builder = new SubTimelineBuilder(this._driver, instruction.element, instruction.keyframes, instruction.preStyleProps, instruction.postStyleProps, updatedTimings, instruction.stretchStartingKeyframe);
        this.timelines.push(builder);
        return updatedTimings;
    }
    incrementTime(time) {
        this.currentTimeline.forwardTime(this.currentTimeline.duration + time);
    }
    delayNextStep(delay) {
        // negative delays are not yet supported
        if (delay > 0) {
            this.currentTimeline.delayNextStep(delay);
        }
    }
    invokeQuery(selector, originalSelector, limit, includeSelf, optional, errors) {
        let results = [];
        if (includeSelf) {
            results.push(this.element);
        }
        if (selector.length > 0) {
            // only if :self is used then the selector can be empty
            selector = selector.replace(ENTER_TOKEN_REGEX, '.' + this._enterClassName);
            selector = selector.replace(LEAVE_TOKEN_REGEX, '.' + this._leaveClassName);
            const multi = limit != 1;
            let elements = this._driver.query(this.element, selector, multi);
            if (limit !== 0) {
                elements =
                    limit < 0
                        ? elements.slice(elements.length + limit, elements.length)
                        : elements.slice(0, limit);
            }
            results.push(...elements);
        }
        if (!optional && results.length == 0) {
            errors.push(invalidQuery(originalSelector));
        }
        return results;
    }
}
export class TimelineBuilder {
    constructor(_driver, element, startTime, _elementTimelineStylesLookup) {
        this._driver = _driver;
        this.element = element;
        this.startTime = startTime;
        this._elementTimelineStylesLookup = _elementTimelineStylesLookup;
        this.duration = 0;
        this.easing = null;
        this._previousKeyframe = new Map();
        this._currentKeyframe = new Map();
        this._keyframes = new Map();
        this._styleSummary = new Map();
        this._localTimelineStyles = new Map();
        this._pendingStyles = new Map();
        this._backFill = new Map();
        this._currentEmptyStepKeyframe = null;
        if (!this._elementTimelineStylesLookup) {
            this._elementTimelineStylesLookup = new Map();
        }
        this._globalTimelineStyles = this._elementTimelineStylesLookup.get(element);
        if (!this._globalTimelineStyles) {
            this._globalTimelineStyles = this._localTimelineStyles;
            this._elementTimelineStylesLookup.set(element, this._localTimelineStyles);
        }
        this._loadKeyframe();
    }
    containsAnimation() {
        switch (this._keyframes.size) {
            case 0:
                return false;
            case 1:
                return this.hasCurrentStyleProperties();
            default:
                return true;
        }
    }
    hasCurrentStyleProperties() {
        return this._currentKeyframe.size > 0;
    }
    get currentTime() {
        return this.startTime + this.duration;
    }
    delayNextStep(delay) {
        // in the event that a style() step is placed right before a stagger()
        // and that style() step is the very first style() value in the animation
        // then we need to make a copy of the keyframe [0, copy, 1] so that the delay
        // properly applies the style() values to work with the stagger...
        const hasPreStyleStep = this._keyframes.size === 1 && this._pendingStyles.size;
        if (this.duration || hasPreStyleStep) {
            this.forwardTime(this.currentTime + delay);
            if (hasPreStyleStep) {
                this.snapshotCurrentStyles();
            }
        }
        else {
            this.startTime += delay;
        }
    }
    fork(element, currentTime) {
        this.applyStylesToKeyframe();
        return new TimelineBuilder(this._driver, element, currentTime || this.currentTime, this._elementTimelineStylesLookup);
    }
    _loadKeyframe() {
        if (this._currentKeyframe) {
            this._previousKeyframe = this._currentKeyframe;
        }
        this._currentKeyframe = this._keyframes.get(this.duration);
        if (!this._currentKeyframe) {
            this._currentKeyframe = new Map();
            this._keyframes.set(this.duration, this._currentKeyframe);
        }
    }
    forwardFrame() {
        this.duration += ONE_FRAME_IN_MILLISECONDS;
        this._loadKeyframe();
    }
    forwardTime(time) {
        this.applyStylesToKeyframe();
        this.duration = time;
        this._loadKeyframe();
    }
    _updateStyle(prop, value) {
        this._localTimelineStyles.set(prop, value);
        this._globalTimelineStyles.set(prop, value);
        this._styleSummary.set(prop, { time: this.currentTime, value });
    }
    allowOnlyTimelineStyles() {
        return this._currentEmptyStepKeyframe !== this._currentKeyframe;
    }
    applyEmptyStep(easing) {
        if (easing) {
            this._previousKeyframe.set('easing', easing);
        }
        // special case for animate(duration):
        // all missing styles are filled with a `*` value then
        // if any destination styles are filled in later on the same
        // keyframe then they will override the overridden styles
        // We use `_globalTimelineStyles` here because there may be
        // styles in previous keyframes that are not present in this timeline
        for (let [prop, value] of this._globalTimelineStyles) {
            this._backFill.set(prop, value || AUTO_STYLE);
            this._currentKeyframe.set(prop, AUTO_STYLE);
        }
        this._currentEmptyStepKeyframe = this._currentKeyframe;
    }
    setStyles(input, easing, errors, options) {
        if (easing) {
            this._previousKeyframe.set('easing', easing);
        }
        const params = (options && options.params) || {};
        const styles = flattenStyles(input, this._globalTimelineStyles);
        for (let [prop, value] of styles) {
            const val = interpolateParams(value, params, errors);
            this._pendingStyles.set(prop, val);
            if (!this._localTimelineStyles.has(prop)) {
                this._backFill.set(prop, this._globalTimelineStyles.get(prop) ?? AUTO_STYLE);
            }
            this._updateStyle(prop, val);
        }
    }
    applyStylesToKeyframe() {
        if (this._pendingStyles.size == 0)
            return;
        this._pendingStyles.forEach((val, prop) => {
            this._currentKeyframe.set(prop, val);
        });
        this._pendingStyles.clear();
        this._localTimelineStyles.forEach((val, prop) => {
            if (!this._currentKeyframe.has(prop)) {
                this._currentKeyframe.set(prop, val);
            }
        });
    }
    snapshotCurrentStyles() {
        for (let [prop, val] of this._localTimelineStyles) {
            this._pendingStyles.set(prop, val);
            this._updateStyle(prop, val);
        }
    }
    getFinalKeyframe() {
        return this._keyframes.get(this.duration);
    }
    get properties() {
        const properties = [];
        for (let prop in this._currentKeyframe) {
            properties.push(prop);
        }
        return properties;
    }
    mergeTimelineCollectedStyles(timeline) {
        timeline._styleSummary.forEach((details1, prop) => {
            const details0 = this._styleSummary.get(prop);
            if (!details0 || details1.time > details0.time) {
                this._updateStyle(prop, details1.value);
            }
        });
    }
    buildKeyframes() {
        this.applyStylesToKeyframe();
        const preStyleProps = new Set();
        const postStyleProps = new Set();
        const isEmpty = this._keyframes.size === 1 && this.duration === 0;
        let finalKeyframes = [];
        this._keyframes.forEach((keyframe, time) => {
            const finalKeyframe = new Map([...this._backFill, ...keyframe]);
            finalKeyframe.forEach((value, prop) => {
                if (value === PRE_STYLE) {
                    preStyleProps.add(prop);
                }
                else if (value === AUTO_STYLE) {
                    postStyleProps.add(prop);
                }
            });
            if (!isEmpty) {
                finalKeyframe.set('offset', time / this.duration);
            }
            finalKeyframes.push(finalKeyframe);
        });
        const preProps = [...preStyleProps.values()];
        const postProps = [...postStyleProps.values()];
        // special case for a 0-second animation (which is designed just to place styles onscreen)
        if (isEmpty) {
            const kf0 = finalKeyframes[0];
            const kf1 = new Map(kf0);
            kf0.set('offset', 0);
            kf1.set('offset', 1);
            finalKeyframes = [kf0, kf1];
        }
        return createTimelineInstruction(this.element, finalKeyframes, preProps, postProps, this.duration, this.startTime, this.easing, false);
    }
}
class SubTimelineBuilder extends TimelineBuilder {
    constructor(driver, element, keyframes, preStyleProps, postStyleProps, timings, _stretchStartingKeyframe = false) {
        super(driver, element, timings.delay);
        this.keyframes = keyframes;
        this.preStyleProps = preStyleProps;
        this.postStyleProps = postStyleProps;
        this._stretchStartingKeyframe = _stretchStartingKeyframe;
        this.timings = { duration: timings.duration, delay: timings.delay, easing: timings.easing };
    }
    containsAnimation() {
        return this.keyframes.length > 1;
    }
    buildKeyframes() {
        let keyframes = this.keyframes;
        let { delay, duration, easing } = this.timings;
        if (this._stretchStartingKeyframe && delay) {
            const newKeyframes = [];
            const totalTime = duration + delay;
            const startingGap = delay / totalTime;
            // the original starting keyframe now starts once the delay is done
            const newFirstKeyframe = new Map(keyframes[0]);
            newFirstKeyframe.set('offset', 0);
            newKeyframes.push(newFirstKeyframe);
            const oldFirstKeyframe = new Map(keyframes[0]);
            oldFirstKeyframe.set('offset', roundOffset(startingGap));
            newKeyframes.push(oldFirstKeyframe);
            /*
              When the keyframe is stretched then it means that the delay before the animation
              starts is gone. Instead the first keyframe is placed at the start of the animation
              and it is then copied to where it starts when the original delay is over. This basically
              means nothing animates during that delay, but the styles are still rendered. For this
              to work the original offset values that exist in the original keyframes must be "warped"
              so that they can take the new keyframe + delay into account.
      
              delay=1000, duration=1000, keyframes = 0 .5 1
      
              turns into
      
              delay=0, duration=2000, keyframes = 0 .33 .66 1
             */
            // offsets between 1 ... n -1 are all warped by the keyframe stretch
            const limit = keyframes.length - 1;
            for (let i = 1; i <= limit; i++) {
                let kf = new Map(keyframes[i]);
                const oldOffset = kf.get('offset');
                const timeAtKeyframe = delay + oldOffset * duration;
                kf.set('offset', roundOffset(timeAtKeyframe / totalTime));
                newKeyframes.push(kf);
            }
            // the new starting keyframe should be added at the start
            duration = totalTime;
            delay = 0;
            easing = '';
            keyframes = newKeyframes;
        }
        return createTimelineInstruction(this.element, keyframes, this.preStyleProps, this.postStyleProps, duration, delay, easing, true);
    }
}
function roundOffset(offset, decimalPoints = 3) {
    const mult = Math.pow(10, decimalPoints - 1);
    return Math.round(offset * mult) / mult;
}
function flattenStyles(input, allStyles) {
    const styles = new Map();
    let allProperties;
    input.forEach((token) => {
        if (token === '*') {
            allProperties ??= allStyles.keys();
            for (let prop of allProperties) {
                styles.set(prop, AUTO_STYLE);
            }
        }
        else {
            for (let [prop, val] of token) {
                styles.set(prop, val);
            }
        }
    });
    return styles;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RpbWVsaW5lX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL2RzbC9hbmltYXRpb25fdGltZWxpbmVfYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBR0wscUJBQXFCLEVBR3JCLFVBQVUsRUFDVixVQUFVLElBQUksU0FBUyxHQUV4QixNQUFNLHFCQUFxQixDQUFDO0FBRTdCLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUU5QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixFQUFFLFlBQVksRUFBQyxNQUFNLFNBQVMsQ0FBQztBQXFCM0YsT0FBTyxFQUVMLHlCQUF5QixHQUMxQixNQUFNLGtDQUFrQyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBRWhFLE1BQU0seUJBQXlCLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQztBQUM3QixNQUFNLGlCQUFpQixHQUFHLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN2RCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUM7QUFDN0IsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFFdkQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNkVHO0FBQ0gsTUFBTSxVQUFVLHVCQUF1QixDQUNyQyxNQUF1QixFQUN2QixXQUFnQixFQUNoQixHQUErQixFQUMvQixjQUFzQixFQUN0QixjQUFzQixFQUN0QixpQkFBZ0Ms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SUFDSixDQUFDO0NBQ0Y7QUFFRCxTQUFTLFdBQVcsQ0FBQyxNQUFjLEVBQUUsYUFBYSxHQUFHLENBQUM7SUFDcEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsYUFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzdDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzFDLENBQUM7QUFFRCxTQUFTLGFBQWEsQ0FBQyxLQUFvQyxFQUFFLFNBQXdCO0lBQ25GLE1BQU0sTUFBTSxHQUFrQixJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3hDLElBQUksYUFBa0QsQ0FBQztJQUN2RCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7UUFDdEIsSUFBSSxLQUFLLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDbEIsYUFBYSxLQUFLLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNuQyxLQUFLLElBQUksSUFBSSxJQUFJLGFBQWEsRUFBRSxDQUFDO2dCQUMvQixNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMvQixDQUFDO1FBQ0gsQ0FBQzthQUFNLENBQUM7WUFDTixLQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksS0FBc0IsRUFBRSxDQUFDO2dCQUMvQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN4QixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cbmltcG9ydCB7XG4gIEFuaW1hdGVDaGlsZE9wdGlvbnMsXG4gIEFuaW1hdGVUaW1pbmdzLFxuICBBbmltYXRpb25NZXRhZGF0YVR5cGUsXG4gIEFuaW1hdGlvbk9wdGlvbnMsXG4gIEFuaW1hdGlvblF1ZXJ5T3B0aW9ucyxcbiAgQVVUT19TVFlMRSxcbiAgybVQUkVfU1RZTEUgYXMgUFJFX1NUWUxFLFxuICDJtVN0eWxlRGF0YU1hcCxcbn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7aW52YWxpZFF1ZXJ5fSBmcm9tICcuLi9lcnJvcl9oZWxwZXJzJztcbmltcG9ydCB7QW5pbWF0aW9uRHJpdmVyfSBmcm9tICcuLi9yZW5kZXIvYW5pbWF0aW9uX2RyaXZlcic7XG5pbXBvcnQge2ludGVycG9sYXRlUGFyYW1zLCByZXNvbHZlVGltaW5nLCByZXNvbHZlVGltaW5nVmFsdWUsIHZpc2l0RHNsTm9kZX0gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7XG4gIEFuaW1hdGVBc3QsXG4gIEFuaW1hdGVDaGlsZEFzdCxcbiAgQW5pbWF0ZVJlZkFzdCxcbiAgQXN0LFxuICBBc3RWaXNpdG9yLFxuICBEeW5hbWljVGltaW5nQXN0LFxuICBHcm91cEFzdCxcbiAgS2V5ZnJhbWVzQXN0LFxuICBRdWVyeUFzdCxcbiAgUmVmZXJlbmNlQXN0LFxuICBTZXF1ZW5jZUFzdCxcbiAgU3RhZ2dlckFzdCxcbiAgU3RhdGVBc3QsXG4gIFN0eWxlQXN0LFxuICBUaW1pbmdBc3QsXG4gIFRyYW5zaXRpb25Bc3QsXG4gIFRyaWdnZXJBc3QsXG59IGZyb20gJy4vYW5pbWF0aW9uX2FzdCc7XG5pbXBvcnQge1xuICBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uLFxuICBjcmVhdGVUaW1lbGluZUluc3RydWN0aW9uLFxufSBmcm9tICcuL2FuaW1hdGlvbl90aW1lbGluZV9pbnN0cnVjdGlvbic7XG5pbXBvcnQge0VsZW1lbnRJbnN0cnVjdGlvbk1hcH0gZnJvbSAnLi9lbGVtZW50X2luc3RydWN0aW9uX21hcCc7XG5cbmNvbnN0IE9ORV9GUkFNRV9JTl9NSUxMSVNFQ09ORFMgPSAxO1xuY29uc3QgRU5URVJfVE9LRU4gPSAnOmVudGVyJztcbmNvbnN0IEVOVEVSX1RPS0VOX1JFR0VYID0gbmV3IFJlZ0V4cChFTlRFUl9UT0tFTiwgJ2cnKTtcbmNvbnN0IExFQVZFX1RPS0VOID0gJzpsZWF2ZSc7XG5jb25zdCBMRUFWRV9UT0tFTl9SRUdFWCA9IG5ldyBSZWdFeHAoTEVBVkVfVE9LRU4sICdnJyk7XG5cbi8qXG4gKiBUaGUgY29kZSB3aXRoaW4gdGhpcyBmaWxlIGFpbXMgdG8gZ2VuZXJhdGUgd2ViLWFuaW1hdGlvbnMtY29tcGF0aWJsZSBrZXlmcmFtZXMgZnJvbSBBbmd1bGFyJ3NcbiAqIGFuaW1hdGlvbiBEU0wgY29kZS5cbiAqXG4gKiBUaGUgY29kZSBiZWxvdyB3aWxsIGJlIGNvbnZlcnRlZCBmcm9tOlxuICpcbiAqIGBgYFxuICogc2VxdWVuY2UoW1xuICogICBzdHlsZSh7IG9wYWNpdHk6IDAgfSksXG4gKiAgIGFuaW1hdGUoMTAwMCwgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKVxuICogXSlcbiAqIGBgYFxuICpcbiAqIFRvOlxuICogYGBgXG4gKiBrZXlmcmFtZXMgPSBbeyBvcGFjaXR5OiAwLCBvZmZzZXQ6IDAgfSwgeyBvcGFjaXR5OiAxLCBvZmZzZXQ6IDEgfV1cbiAqIGR1cmF0aW9uID0gMTAwMFxuICogZGVsYXkgPSAwXG4gKiBlYXNpbmcgPSAnJ1xuICogYGBgXG4gKlxuICogRm9yIHRoaXMgb3BlcmF0aW9uIHRvIGNvdmVyIHRoZSBjb21iaW5hdGlvbiBvZiBhbmltYXRpb24gdmVyYnMgKHN0eWxlLCBhbmltYXRlLCBncm91cCwgZXRjLi4uKSBhXG4gKiBjb21iaW5hdGlvbiBvZiBBU1QgdHJhdmVyc2FsIGFuZCBtZXJnZS1zb3J0LWxpa2UgYWxnb3JpdGhtcyBhcmUgdXNlZC5cbiAqXG4gKiBbQVNUIFRyYXZlcnNhbF1cbiAqIEVhY2ggb2YgdGhlIGFuaW1hdGlvbiB2ZXJicywgd2hlbiBleGVjdXRlZCwgd2lsbCByZXR1cm4gYW4gc3RyaW5nLW1hcCBvYmplY3QgcmVwcmVzZW50aW5nIHdoYXRcbiAqIHR5cGUgb2YgYWN0aW9uIGl0IGlzIChzdHlsZSwgYW5pbWF0ZSwgZ3JvdXAsIGV0Yy4uLikgYW5kIHRoZSBkYXRhIGFzc29jaWF0ZWQgd2l0aCBpdC4gVGhpcyBtZWFuc1xuICogdGhhdCB3aGVuIGZ1bmN0aW9uYWwgY29tcG9zaXRpb24gbWl4IG9mIHRoZXNlIGZ1bmN0aW9ucyBpcyBldmFsdWF0ZWQgKGxpa2UgaW4gdGhlIGV4YW1wbGUgYWJvdmUpXG4gKiB0aGVuIGl0IHdpbGwgZW5kIHVwIHByb2R1Y2luZyBhIHRyZWUgb2Ygb2JqZWN0cyByZXByZXNlbnRpbmcgdGhlIGFuaW1hdGlvbiBpdHNlbGYuXG4gKlxuICogV2hlbiB0aGlzIGFuaW1hdGlvbiBvYmplY3QgdHJlZSBpcyBwcm9jZXNzZWQgYnkgdGhlIHZpc2l0b3IgY29kZSBiZWxvdyBpdCB3aWxsIHZpc2l0IGVhY2ggb2YgdGhlXG4gKiB2ZXJiIHN0YXRlbWVudHMgd2l0aGluIHRoZSB2aXNpdG9yLiBBbmQgZHVyaW5nIGVhY2ggdmlzaXQgaXQgd2lsbCBidWlsZCB0aGUgY29udGV4dCBvZiB0aGVcbiAqIGFuaW1hdGlvbiBrZXlmcmFtZXMgYnkgaW50ZXJhY3Rpbmcgd2l0aCB0aGUgYFRpbWVsaW5lQnVpbGRlcmAuXG4gKlxuICogW1RpbWVsaW5lQnVpbGRlcl1cbiAqIFRoaXMgY2xhc3MgaXMgcmVzcG9uc2libGUgZm9yIHRyYWNraW5nIHRoZSBzdHlsZXMgYW5kIGJ1aWxkaW5nIGEgc2VyaWVzIG9mIGtleWZyYW1lIG9iamVjdHMgZm9yIGFcbiAqIHRpbWVsaW5lIGJldHdlZW4gYSBzdGFydCBhbmQgZW5kIHRpbWUuIFRoZSBidWlsZGVyIHN0YXJ0cyBvZmYgd2l0aCBhbiBpbml0aWFsIHRpbWVsaW5lIGFuZCBlYWNoXG4gKiB0aW1lIHRoZSBBU1QgY29tZXMgYWNyb3NzIGEgYGdyb3VwKClgLCBga2V5ZnJhbWVzKClgIG9yIGEgY29tYmluYXRpb24gb2YgdGhlIHR3byB3aXRoaW4gYVxuICogYHNlcXVlbmNlKClgIHRoZW4gaXQgd2lsbCBnZW5lcmF0ZSBhIHN1YiB0aW1lbGluZSBmb3IgZWFjaCBzdGVwIGFzIHdlbGwgYXMgYSBuZXcgb25lIGFmdGVyXG4gKiB0aGV5IGFyZSBjb21wbGV0ZS5cbiAqXG4gKiBBcyB0aGUgQVNUIGlzIHRyYXZlcnNlZCwgdGhlIHRpbWluZyBzdGF0ZSBvbiBlYWNoIG9mIHRoZSB0aW1lbGluZXMgd2lsbCBiZSBpbmNyZW1lbnRlZC4gSWYgYSBzdWJcbiAqIHRpbWVsaW5lIHdhcyBjcmVhdGVkIChiYXNlZCBvbiBvbmUgb2YgdGhlIGNhc2VzIGFib3ZlKSB0aGVuIHRoZSBwYXJlbnQgdGltZWxpbmUgd2lsbCBhdHRlbXB0IHRvXG4gKiBtZXJnZSB0aGUgc3R5bGVzIHVzZWQgd2l0aGluIHRoZSBzdWIgdGltZWxpbmVzIGludG8gaXRzZWxmIChvbmx5IHdpdGggZ3JvdXAoKSB0aGlzIHdpbGwgaGFwcGVuKS5cbiAqIFRoaXMgaGFwcGVucyB3aXRoIGEgbWVyZ2Ugb3BlcmF0aW9uIChtdWNoIGxpa2UgaG93IHRoZSBtZXJnZSB3b3JrcyBpbiBtZXJnZVNvcnQpIGFuZCBpdCB3aWxsIG9ubHlcbiAqIGNvcHkgdGhlIG1vc3QgcmVjZW50bHkgdXNlZCBzdHlsZXMgZnJvbSB0aGUgc3ViIHRpbWVsaW5lcyBpbnRvIHRoZSBwYXJlbnQgdGltZWxpbmUuIFRoaXMgZW5zdXJlc1xuICogdGhhdCBpZiB0aGUgc3R5bGVzIGFyZSB1c2VkIGxhdGVyIG9uIGluIGFub3RoZXIgcGhhc2Ugb2YgdGhlIGFuaW1hdGlvbiB0aGVuIHRoZXkgd2lsbCBiZSB0aGUgbW9zdFxuICogdXAtdG8tZGF0ZSB2YWx1ZXMuXG4gKlxuICogW0hvdyBNaXNzaW5nIFN0eWxlcyBBcmUgVXBkYXRlZF1cbiAqIEVhY2ggdGltZWxpbmUgaGFzIGEgYGJhY2tGaWxsYCBwcm9wZXJ0eSB3aGljaCBpcyByZXNwb25zaWJsZSBmb3IgZmlsbGluZyBpbiBuZXcgc3R5bGVzIGludG9cbiAqIGFscmVhZHkgcHJvY2Vzc2VkIGtleWZyYW1lcyBpZiBhIG5ldyBzdHlsZSBzaG93cyB1cCBsYXRlciB3aXRoaW4gdGhlIGFuaW1hdGlvbiBzZXF1ZW5jZS5cbiAqXG4gKiBgYGBcbiAqIHNlcXVlbmNlKFtcbiAqICAgc3R5bGUoeyB3aWR0aDogMCB9KSxcbiAqICAgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IHdpZHRoOiAxMDAgfSkpLFxuICogICBhbmltYXRlKDEwMDAsIHN0eWxlKHsgd2lkdGg6IDIwMCB9KSksXG4gKiAgIGFuaW1hdGUoMTAwMCwgc3R5bGUoeyB3aWR0aDogMzAwIH0pKVxuICogICBhbmltYXRlKDEwMDAsIHN0eWxlKHsgd2lkdGg6IDQwMCwgaGVpZ2h0OiA0MDAgfSkpIC8vIG5vdGljZSBob3cgYGhlaWdodGAgZG9lc24ndCBleGlzdCBhbnl3aGVyZVxuICogZWxzZVxuICogXSlcbiAqIGBgYFxuICpcbiAqIFdoYXQgaXMgaGFwcGVuaW5nIGhlcmUgaXMgdGhhdCB0aGUgYGhlaWdodGAgdmFsdWUgaXMgYWRkZWQgbGF0ZXIgaW4gdGhlIHNlcXVlbmNlLCBidXQgaXMgbWlzc2luZ1xuICogZnJvbSBhbGwgcHJldmlvdXMgYW5pbWF0aW9uIHN0ZXBzLiBUaGVyZWZvcmUgd2hlbiBhIGtleWZyYW1lIGlzIGNyZWF0ZWQgaXQgd291bGQgYWxzbyBiZSBtaXNzaW5nXG4gKiBmcm9tIGFsbCBwcmV2aW91cyBrZXlmcmFtZXMgdXAgdW50aWwgd2hlcmUgaXQgaXMgZmlyc3QgdXNlZC4gRm9yIHRoZSB0aW1lbGluZSBrZXlmcmFtZSBnZW5lcmF0aW9uXG4gKiB0byBwcm9wZXJseSBmaWxsIGluIHRoZSBzdHlsZSBpdCB3aWxsIHBsYWNlIHRoZSBwcmV2aW91cyB2YWx1ZSAodGhlIHZhbHVlIGZyb20gdGhlIHBhcmVudFxuICogdGltZWxpbmUpIG9yIGEgZGVmYXVsdCB2YWx1ZSBvZiBgKmAgaW50byB0aGUgYmFja0ZpbGwgbWFwLlxuICpcbiAqIFdoZW4gYSBzdWItdGltZWxpbmUgaXMgY3JlYXRlZCBpdCB3aWxsIGhhdmUgaXRzIG93biBiYWNrRmlsbCBwcm9wZXJ0eS4gVGhpcyBpcyBkb25lIHNvIHRoYXRcbiAqIHN0eWxlcyBwcmVzZW50IHdpdGhpbiB0aGUgc3ViLXRpbWVsaW5lIGRvIG5vdCBhY2NpZGVudGFsbHkgc2VlcCBpbnRvIHRoZSBwcmV2aW91cy9mdXR1cmUgdGltZWxpbmVcbiAqIGtleWZyYW1lc1xuICpcbiAqIFtWYWxpZGF0aW9uXVxuICogVGhlIGNvZGUgaW4gdGhpcyBmaWxlIGlzIG5vdCByZXNwb25zaWJsZSBmb3IgdmFsaWRhdGlvbi4gVGhhdCBmdW5jdGlvbmFsaXR5IGhhcHBlbnMgd2l0aCB3aXRoaW5cbiAqIHRoZSBgQW5pbWF0aW9uVmFsaWRhdG9yVmlzaXRvcmAgY29kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQW5pbWF0aW9uVGltZWxpbmVzKFxuICBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlcixcbiAgcm9vdEVsZW1lbnQ6IGFueSxcbiAgYXN0OiBBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPixcbiAgZW50ZXJDbGFzc05hbWU6IHN0cmluZyxcbiAgbGVhdmVDbGFzc05hbWU6IHN0cmluZyxcbiAgc3RhcnRpbmdTdHlsZXM6IMm1U3R5bGVEYXRhTWFwID0gbmV3IE1hcCgpLFxuICBmaW5hbFN0eWxlczogybVTdHlsZURhdGFNYXAgPSBuZXcgTWFwKCksXG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMsXG4gIHN1Ykluc3RydWN0aW9ucz86IEVsZW1lbnRJbnN0cnVjdGlvbk1hcCxcbiAgZXJyb3JzOiBFcnJvcltdID0gW10sXG4pOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW10ge1xuICByZXR1cm4gbmV3IEFuaW1hdGlvblRpbWVsaW5lQnVpbGRlclZpc2l0b3IoKS5idWlsZEtleWZyYW1lcyhcbiAgICBkcml2ZXIsXG4gICAgcm9vdEVsZW1lbnQsXG4gICAgYXN0LFxuICAgIGVudGVyQ2xhc3NOYW1lLFxuICAgIGxlYXZlQ2xhc3NOYW1lLFxuICAgIHN0YXJ0aW5nU3R5bGVzLFxuICAgIGZpbmFsU3R5bGVzLFxuICAgIG9wdGlvbnMsXG4gICAgc3ViSW5zdHJ1Y3Rpb25zLFxuICAgIGVycm9ycyxcbiAgKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvblRpbWVsaW5lQnVpbGRlclZpc2l0b3IgaW1wbGVtZW50cyBBc3RWaXNpdG9yIHtcbiAgYnVpbGRLZXlmcmFtZXMoXG4gICAgZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsXG4gICAgcm9vdEVsZW1lbnQ6IGFueSxcbiAgICBhc3Q6IEFzdDxBbmltYXRpb25NZXRhZGF0YVR5cGU+LFxuICAgIGVudGVyQ2xhc3NOYW1lOiBzdHJpbmcsXG4gICAgbGVhdmVDbGFzc05hbWU6IHN0cmluZyxcbiAgICBzdGFydGluZ1N0eWxlczogybVTdHlsZURhdGFNYXAsXG4gICAgZmluYWxTdHlsZXM6IMm1U3R5bGVEYXRhTWFwLFxuICAgIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMsXG4gICAgc3ViSW5zdHJ1Y3Rpb25zPzogRWxlbWVudEluc3RydWN0aW9uTWFwLFxuICAgIGVycm9yczogRXJyb3JbXSA9IFtdLFxuICApOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW10ge1xuICAgIHN1Ykluc3RydWN0aW9ucyA9IHN1Ykluc3RydWN0aW9ucyB8fCBuZXcgRWxlbWVudEluc3RydWN0aW9uTWFwKCk7XG4gICAgY29uc3QgY29udGV4dCA9IG5ldyBBbmltYXRpb25UaW1lbGluZUNvbnRleHQoXG4gICAgICBkcml2ZXIsXG4gICAgICByb290RWxlbWVudCxcbiAgICAgIHN1Ykluc3RydWN0aW9ucyxcbiAgICAgIGVudGVyQ2xhc3NOYW1lLFxuICAgICAgbGVhdmVDbGFzc05hbWUsXG4gICAgICBlcnJvcnMsXG4gICAgICBbXSxcbiAgICApO1xuICAgIGNvbnRleHQub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgY29uc3QgZGVsYXkgPSBvcHRpb25zLmRlbGF5ID8gcmVzb2x2ZVRpbWluZ1ZhbHVlKG9wdGlvbnMuZGVsYXkpIDogMDtcbiAgICBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5kZWxheU5leHRTdGVwKGRlbGF5KTtcbiAgICBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5zZXRTdHlsZXMoW3N0YXJ0aW5nU3R5bGVzXSwgbnVsbCwgY29udGV4dC5lcnJvcnMsIG9wdGlvbnMpO1xuXG4gICAgdmlzaXREc2xOb2RlKHRoaXMsIGFzdCwgY29udGV4dCk7XG5cbiAgICAvLyB0aGlzIGNoZWNrcyB0byBzZWUgaWYgYW4gYWN0dWFsIGFuaW1hdGlvbiBoYXBwZW5lZFxuICAgIGNvbnN0IHRpbWVsaW5lcyA9IGNvbnRleHQudGltZWxpbmVzLmZpbHRlcigodGltZWxpbmUpID0+IHRpbWVsaW5lLmNvbnRhaW5zQW5pbWF0aW9uKCkpO1xuXG4gICAgLy8gbm90ZTogd2UganVzdCB3YW50IHRvIGFwcGx5IHRoZSBmaW5hbCBzdHlsZXMgZm9yIHRoZSByb290RWxlbWVudCwgc28gd2UgZG8gbm90XG4gICAgLy8gICAgICAganVzdCBhcHBseSB0aGUgc3R5bGVzIHRvIHRoZSBsYXN0IHRpbWVsaW5lIGJ1dCB0aGUgbGFzdCB0aW1lbGluZSB3aGljaFxuICAgIC8vICAgICAgIGVsZW1lbnQgaXMgdGhlIHJvb3Qgb25lIChiYXNpY2FsbHkgYCpgLXN0eWxlcyBhcmUgcmVwbGFjZWQgd2l0aCB0aGUgYWN0dWFsXG4gICAgLy8gICAgICAgc3RhdGUgc3R5bGUgdmFsdWVzIG9ubHkgZm9yIHRoZSByb290IGVsZW1lbnQpXG4gICAgaWYgKHRpbWVsaW5lcy5sZW5ndGggJiYgZmluYWxTdHlsZXMuc2l6ZSkge1xuICAgICAgbGV0IGxhc3RSb290VGltZWxpbmU6IFRpbWVsaW5lQnVpbGRlciB8IHVuZGVmaW5lZDtcbiAgICAgIGZvciAobGV0IGkgPSB0aW1lbGluZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgY29uc3QgdGltZWxpbmUgPSB0aW1lbGluZXNbaV07XG4gICAgICAgIGlmICh0aW1lbGluZS5lbGVtZW50ID09PSByb290RWxlbWVudCkge1xuICAgICAgICAgIGxhc3RSb290VGltZWxpbmUgPSB0aW1lbGluZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGxhc3RSb290VGltZWxpbmUgJiYgIWxhc3RSb290VGltZWxpbmUuYWxsb3dPbmx5VGltZWxpbmVTdHlsZXMoKSkge1xuICAgICAgICBsYXN0Um9vdFRpbWVsaW5lLnNldFN0eWxlcyhbZmluYWxTdHlsZXNdLCBudWxsLCBjb250ZXh0LmVycm9ycywgb3B0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aW1lbGluZXMubGVuZ3RoXG4gICAgICA/IHRpbWVsaW5lcy5tYXAoKHRpbWVsaW5lKSA9PiB0aW1lbGluZS5idWlsZEtleWZyYW1lcygpKVxuICAgICAgOiBbY3JlYXRlVGltZWxpbmVJbnN0cnVjdGlvbihyb290RWxlbWVudCwgW10sIFtdLCBbXSwgMCwgZGVsYXksICcnLCBmYWxzZSldO1xuICB9XG5cbiAgdmlzaXRUcmlnZ2VyKGFzdDogVHJpZ2dlckFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICAvLyB0aGVzZSB2YWx1ZXMgYXJlIG5vdCB2aXNpdGVkIGluIHRoaXMgQVNUXG4gIH1cblxuICB2aXNpdFN0YXRlKGFzdDogU3RhdGVBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCk6IGFueSB7XG4gICAgLy8gdGhlc2UgdmFsdWVzIGFyZSBub3QgdmlzaXRlZCBpbiB0aGlzIEFTVFxuICB9XG5cbiAgdmlzaXRUcmFuc2l0aW9uKGFzdDogVHJhbnNpdGlvbkFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICAvLyB0aGVzZSB2YWx1ZXMgYXJlIG5vdCB2aXNpdGVkIGluIHRoaXMgQVNUXG4gIH1cblxuICB2aXNpdEFuaW1hdGVDaGlsZChhc3Q6IEFuaW1hdGVDaGlsZEFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICBjb25zdCBlbGVtZW50SW5zdHJ1Y3Rpb25zID0gY29udGV4dC5zdWJJbnN0cnVjdGlvbnMuZ2V0KGNvbnRleHQuZWxlbWVudCk7XG4gICAgaWYgKGVsZW1lbnRJbnN0cnVjdGlvbnMpIHtcbiAgICAgIGNvbnN0IGlubmVyQ29udGV4dCA9IGNvbnRleHQuY3JlYXRlU3ViQ29udGV4dChhc3Qub3B0aW9ucyk7XG4gICAgICBjb25zdCBzdGFydFRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZTtcbiAgICAgIGNvbnN0IGVuZFRpbWUgPSB0aGlzLl92aXNpdFN1Ykluc3RydWN0aW9ucyhcbiAgICAgICAgZWxlbWVudEluc3RydWN0aW9ucyxcbiAgICAgICAgaW5uZXJDb250ZXh0LFxuICAgICAgICBpbm5lckNvbnRleHQub3B0aW9ucyBhcyBBbmltYXRlQ2hpbGRPcHRpb25zLFxuICAgICAgKTtcbiAgICAgIGlmIChzdGFydFRpbWUgIT0gZW5kVGltZSkge1xuICAgICAgICAvLyB3ZSBkbyB0aGlzIG9uIHRoZSB1cHBlciBjb250ZXh0IGJlY2F1c2Ugd2UgY3JlYXRlZCBhIHN1YiBjb250ZXh0IGZvclxuICAgICAgICAvLyB0aGUgc3ViIGNoaWxkIGFuaW1hdGlvbnNcbiAgICAgICAgY29udGV4dC50cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUoZW5kVGltZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuICB9XG5cbiAgdmlzaXRBbmltYXRlUmVmKGFzdDogQW5pbWF0ZVJlZkFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICBjb25zdCBpbm5lckNvbnRleHQgPSBjb250ZXh0LmNyZWF0ZVN1YkNvbnRleHQoYXN0Lm9wdGlvbnMpO1xuICAgIGlubmVyQ29udGV4dC50cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUoKTtcbiAgICB0aGlzLl9hcHBseUFuaW1hdGlvblJlZkRlbGF5cyhbYXN0Lm9wdGlvbnMsIGFzdC5hbmltYXRpb24ub3B0aW9uc10sIGNvbnRleHQsIGlubmVyQ29udGV4dCk7XG4gICAgdGhpcy52aXNpdFJlZmVyZW5jZShhc3QuYW5pbWF0aW9uLCBpbm5lckNvbnRleHQpO1xuICAgIGNvbnRleHQudHJhbnNmb3JtSW50b05ld1RpbWVsaW5lKGlubmVyQ29udGV4dC5jdXJyZW50VGltZWxpbmUuY3VycmVudFRpbWUpO1xuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlBbmltYXRpb25SZWZEZWxheXMoXG4gICAgYW5pbWF0aW9uc1JlZnNPcHRpb25zOiAoQW5pbWF0aW9uT3B0aW9ucyB8IG51bGwpW10sXG4gICAgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0LFxuICAgIGlubmVyQ29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0LFxuICApIHtcbiAgICBmb3IgKGNvbnN0IGFuaW1hdGlvblJlZk9wdGlvbnMgb2YgYW5pbWF0aW9uc1JlZnNPcHRpb25zKSB7XG4gICAgICBjb25zdCBhbmltYXRpb25EZWxheSA9IGFuaW1hdGlvblJlZk9wdGlvbnM/LmRlbGF5O1xuICAgICAgaWYgKGFuaW1hdGlvbkRlbGF5KSB7XG4gICAgICAgIGNvbnN0IGFuaW1hdGlvbkRlbGF5VmFsdWUgPVxuICAgICAgICAgIHR5cGVvZiBhbmltYXRpb25EZWxheSA9PT0gJ251bWJlcidcbiAgICAgICAgICAgID8gYW5pbWF0aW9uRGVsYXlcbiAgICAgICAgICAgIDogcmVzb2x2ZVRpbWluZ1ZhbHVlKFxuICAgICAgICAgICAgICAgIGludGVycG9sYXRlUGFyYW1zKFxuICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uRGVsYXksXG4gICAgICAgICAgICAgICAgICBhbmltYXRpb25SZWZPcHRpb25zPy5wYXJhbXMgPz8ge30sXG4gICAgICAgICAgICAgICAgICBjb250ZXh0LmVycm9ycyxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICApO1xuICAgICAgICBpbm5lckNvbnRleHQuZGVsYXlOZXh0U3RlcChhbmltYXRpb25EZWxheVZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFN1Ykluc3RydWN0aW9ucyhcbiAgICBpbnN0cnVjdGlvbnM6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb25bXSxcbiAgICBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQsXG4gICAgb3B0aW9uczogQW5pbWF0ZUNoaWxkT3B0aW9ucyxcbiAgKTogbnVtYmVyIHtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZTtcbiAgICBsZXQgZnVydGhlc3RUaW1lID0gc3RhcnRUaW1lO1xuXG4gICAgLy8gdGhpcyBpcyBhIHNwZWNpYWwtY2FzZSBmb3Igd2hlbiBhIHVzZXIgd2FudHMgdG8gc2tpcCBhIHN1YlxuICAgIC8vIGFuaW1hdGlvbiBmcm9tIGJlaW5nIGZpcmVkIGVudGlyZWx5LlxuICAgIGNvbnN0IGR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbiAhPSBudWxsID8gcmVzb2x2ZVRpbWluZ1ZhbHVlKG9wdGlvbnMuZHVyYXRpb24pIDogbnVsbDtcbiAgICBjb25zdCBkZWxheSA9IG9wdGlvbnMuZGVsYXkgIT0gbnVsbCA/IHJlc29sdmVUaW1pbmdWYWx1ZShvcHRpb25zLmRlbGF5KSA6IG51bGw7XG4gICAgaWYgKGR1cmF0aW9uICE9PSAwKSB7XG4gICAgICBpbnN0cnVjdGlvbnMuZm9yRWFjaCgoaW5zdHJ1Y3Rpb24pID0+IHtcbiAgICAgICAgY29uc3QgaW5zdHJ1Y3Rpb25UaW1pbmdzID0gY29udGV4dC5hcHBlbmRJbnN0cnVjdGlvblRvVGltZWxpbmUoXG4gICAgICAgICAgaW5zdHJ1Y3Rpb24sXG4gICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgICAgZGVsYXksXG4gICAgICAgICk7XG4gICAgICAgIGZ1cnRoZXN0VGltZSA9IE1hdGgubWF4KFxuICAgICAgICAgIGZ1cnRoZXN0VGltZSxcbiAgICAgICAgICBpbnN0cnVjdGlvblRpbWluZ3MuZHVyYXRpb24gKyBpbnN0cnVjdGlvblRpbWluZ3MuZGVsYXksXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVydGhlc3RUaW1lO1xuICB9XG5cbiAgdmlzaXRSZWZlcmVuY2UoYXN0OiBSZWZlcmVuY2VBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCkge1xuICAgIGNvbnRleHQudXBkYXRlT3B0aW9ucyhhc3Qub3B0aW9ucywgdHJ1ZSk7XG4gICAgdmlzaXREc2xOb2RlKHRoaXMsIGFzdC5hbmltYXRpb24sIGNvbnRleHQpO1xuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuICB9XG5cbiAgdmlzaXRTZXF1ZW5jZShhc3Q6IFNlcXVlbmNlQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBjb25zdCBzdWJDb250ZXh0Q291bnQgPSBjb250ZXh0LnN1YkNvbnRleHRDb3VudDtcbiAgICBsZXQgY3R4ID0gY29udGV4dDtcbiAgICBjb25zdCBvcHRpb25zID0gYXN0Lm9wdGlvbnM7XG5cbiAgICBpZiAob3B0aW9ucyAmJiAob3B0aW9ucy5wYXJhbXMgfHwgb3B0aW9ucy5kZWxheSkpIHtcbiAgICAgIGN0eCA9IGNvbnRleHQuY3JlYXRlU3ViQ29udGV4dChvcHRpb25zKTtcbiAgICAgIGN0eC50cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUoKTtcblxuICAgICAgaWYgKG9wdGlvbnMuZGVsYXkgIT0gbnVsbCkge1xuICAgICAgICBpZiAoY3R4LnByZXZpb3VzTm9kZS50eXBlID09IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TdHlsZSkge1xuICAgICAgICAgIGN0eC5jdXJyZW50VGltZWxpbmUuc25hcHNob3RDdXJyZW50U3R5bGVzKCk7XG4gICAgICAgICAgY3R4LnByZXZpb3VzTm9kZSA9IERFRkFVTFRfTk9PUF9QUkVWSU9VU19OT0RFO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVsYXkgPSByZXNvbHZlVGltaW5nVmFsdWUob3B0aW9ucy5kZWxheSk7XG4gICAgICAgIGN0eC5kZWxheU5leHRTdGVwKGRlbGF5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYXN0LnN0ZXBzLmxlbmd0aCkge1xuICAgICAgYXN0LnN0ZXBzLmZvckVhY2goKHMpID0+IHZpc2l0RHNsTm9kZSh0aGlzLCBzLCBjdHgpKTtcblxuICAgICAgLy8gdGhpcyBpcyBoZXJlIGp1c3QgaW4gY2FzZSB0aGUgaW5uZXIgc3RlcHMgb25seSBjb250YWluIG9yIGVuZCB3aXRoIGEgc3R5bGUoKSBjYWxsXG4gICAgICBjdHguY3VycmVudFRpbWVsaW5lLmFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpO1xuXG4gICAgICAvLyB0aGlzIG1lYW5zIHRoYXQgc29tZSBhbmltYXRpb24gZnVuY3Rpb24gd2l0aGluIHRoZSBzZXF1ZW5jZVxuICAgICAgLy8gZW5kZWQgdXAgY3JlYXRpbmcgYSBzdWIgdGltZWxpbmUgKHdoaWNoIG1lYW5zIHRoZSBjdXJyZW50XG4gICAgICAvLyB0aW1lbGluZSBjYW5ub3Qgb3ZlcmxhcCB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgc2VxdWVuY2UpXG4gICAgICBpZiAoY3R4LnN1YkNvbnRleHRDb3VudCA+IHN1YkNvbnRleHRDb3VudCkge1xuICAgICAgICBjdHgudHJhbnNmb3JtSW50b05ld1RpbWVsaW5lKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdEdyb3VwKGFzdDogR3JvdXBBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCkge1xuICAgIGNvbnN0IGlubmVyVGltZWxpbmVzOiBUaW1lbGluZUJ1aWxkZXJbXSA9IFtdO1xuICAgIGxldCBmdXJ0aGVzdFRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZTtcbiAgICBjb25zdCBkZWxheSA9IGFzdC5vcHRpb25zICYmIGFzdC5vcHRpb25zLmRlbGF5ID8gcmVzb2x2ZVRpbWluZ1ZhbHVlKGFzdC5vcHRpb25zLmRlbGF5KSA6IDA7XG5cbiAgICBhc3Quc3RlcHMuZm9yRWFjaCgocykgPT4ge1xuICAgICAgY29uc3QgaW5uZXJDb250ZXh0ID0gY29udGV4dC5jcmVhdGVTdWJDb250ZXh0KGFzdC5vcHRpb25zKTtcbiAgICAgIGlmIChkZWxheSkge1xuICAgICAgICBpbm5lckNvbnRleHQuZGVsYXlOZXh0U3RlcChkZWxheSk7XG4gICAgICB9XG5cbiAgICAgIHZpc2l0RHNsTm9kZSh0aGlzLCBzLCBpbm5lckNvbnRleHQpO1xuICAgICAgZnVydGhlc3RUaW1lID0gTWF0aC5tYXgoZnVydGhlc3RUaW1lLCBpbm5lckNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lKTtcbiAgICAgIGlubmVyVGltZWxpbmVzLnB1c2goaW5uZXJDb250ZXh0LmN1cnJlbnRUaW1lbGluZSk7XG4gICAgfSk7XG5cbiAgICAvLyB0aGlzIG9wZXJhdGlvbiBpcyBydW4gYWZ0ZXIgdGhlIEFTVCBsb29wIGJlY2F1c2Ugb3RoZXJ3aXNlXG4gICAgLy8gaWYgdGhlIHBhcmVudCB0aW1lbGluZSdzIGNvbGxlY3RlZCBzdHlsZXMgd2VyZSB1cGRhdGVkIHRoZW5cbiAgICAvLyBpdCB3b3VsZCBwYXNzIGluIGludmFsaWQgZGF0YSBpbnRvIHRoZSBuZXctdG8tYmUgZm9ya2VkIGl0ZW1zXG4gICAgaW5uZXJUaW1lbGluZXMuZm9yRWFjaCgodGltZWxpbmUpID0+XG4gICAgICBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5tZXJnZVRpbWVsaW5lQ29sbGVjdGVkU3R5bGVzKHRpbWVsaW5lKSxcbiAgICApO1xuICAgIGNvbnRleHQudHJhbnNmb3JtSW50b05ld1RpbWVsaW5lKGZ1cnRoZXN0VGltZSk7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFRpbWluZyhhc3Q6IFRpbWluZ0FzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogQW5pbWF0ZVRpbWluZ3Mge1xuICAgIGlmICgoYXN0IGFzIER5bmFtaWNUaW1pbmdBc3QpLmR5bmFtaWMpIHtcbiAgICAgIGNvbnN0IHN0clZhbHVlID0gKGFzdCBhcyBEeW5hbWljVGltaW5nQXN0KS5zdHJWYWx1ZTtcbiAgICAgIGNvbnN0IHRpbWluZ1ZhbHVlID0gY29udGV4dC5wYXJhbXNcbiAgICAgICAgPyBpbnRlcnBvbGF0ZVBhcmFtcyhzdHJWYWx1ZSwgY29udGV4dC5wYXJhbXMsIGNvbnRleHQuZXJyb3JzKVxuICAgICAgICA6IHN0clZhbHVlO1xuICAgICAgcmV0dXJuIHJlc29sdmVUaW1pbmcodGltaW5nVmFsdWUsIGNvbnRleHQuZXJyb3JzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtkdXJhdGlvbjogYXN0LmR1cmF0aW9uLCBkZWxheTogYXN0LmRlbGF5LCBlYXNpbmc6IGFzdC5lYXNpbmd9O1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0QW5pbWF0ZShhc3Q6IEFuaW1hdGVBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCkge1xuICAgIGNvbnN0IHRpbWluZ3MgPSAoY29udGV4dC5jdXJyZW50QW5pbWF0ZVRpbWluZ3MgPSB0aGlzLl92aXNpdFRpbWluZyhhc3QudGltaW5ncywgY29udGV4dCkpO1xuICAgIGNvbnN0IHRpbWVsaW5lID0gY29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgaWYgKHRpbWluZ3MuZGVsYXkpIHtcbiAgICAgIGNvbnRleHQuaW5jcmVtZW50VGltZSh0aW1pbmdzLmRlbGF5KTtcbiAgICAgIHRpbWVsaW5lLnNuYXBzaG90Q3VycmVudFN0eWxlcygpO1xuICAgIH1cblxuICAgIGNvbnN0IHN0eWxlID0gYXN0LnN0eWxlO1xuICAgIGlmIChzdHlsZS50eXBlID09IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5LZXlmcmFtZXMpIHtcbiAgICAgIHRoaXMudmlzaXRLZXlmcmFtZXMoc3R5bGUsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZXh0LmluY3JlbWVudFRpbWUodGltaW5ncy5kdXJhdGlvbik7XG4gICAgICB0aGlzLnZpc2l0U3R5bGUoc3R5bGUgYXMgU3R5bGVBc3QsIGNvbnRleHQpO1xuICAgICAgdGltZWxpbmUuYXBwbHlTdHlsZXNUb0tleWZyYW1lKCk7XG4gICAgfVxuXG4gICAgY29udGV4dC5jdXJyZW50QW5pbWF0ZVRpbWluZ3MgPSBudWxsO1xuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuICB9XG5cbiAgdmlzaXRTdHlsZShhc3Q6IFN0eWxlQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBjb25zdCB0aW1lbGluZSA9IGNvbnRleHQuY3VycmVudFRpbWVsaW5lO1xuICAgIGNvbnN0IHRpbWluZ3MgPSBjb250ZXh0LmN1cnJlbnRBbmltYXRlVGltaW5ncyE7XG5cbiAgICAvLyB0aGlzIGlzIGEgc3BlY2lhbCBjYXNlIGZvciB3aGVuIGEgc3R5bGUoKSBjYWxsXG4gICAgLy8gZGlyZWN0bHkgZm9sbG93cyAgYW4gYW5pbWF0ZSgpIGNhbGwgKGJ1dCBub3QgaW5zaWRlIG9mIGFuIGFuaW1hdGUoKSBjYWxsKVxuICAgIGlmICghdGltaW5ncyAmJiB0aW1lbGluZS5oYXNDdXJyZW50U3R5bGVQcm9wZXJ0aWVzKCkpIHtcbiAgICAgIHRpbWVsaW5lLmZvcndhcmRGcmFtZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IGVhc2luZyA9ICh0aW1pbmdzICYmIHRpbWluZ3MuZWFzaW5nKSB8fCBhc3QuZWFzaW5nO1xuICAgIGlmIChhc3QuaXNFbXB0eVN0ZXApIHtcbiAgICAgIHRpbWVsaW5lLmFwcGx5RW1wdHlTdGVwKGVhc2luZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRpbWVsaW5lLnNldFN0eWxlcyhhc3Quc3R5bGVzLCBlYXNpbmcsIGNvbnRleHQuZXJyb3JzLCBjb250ZXh0Lm9wdGlvbnMpO1xuICAgIH1cblxuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuICB9XG5cbiAgdmlzaXRLZXlmcmFtZXMoYXN0OiBLZXlmcmFtZXNBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCkge1xuICAgIGNvbnN0IGN1cnJlbnRBbmltYXRlVGltaW5ncyA9IGNvbnRleHQuY3VycmVudEFuaW1hdGVUaW1pbmdzITtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZSEuZHVyYXRpb247XG4gICAgY29uc3QgZHVyYXRpb24gPSBjdXJyZW50QW5pbWF0ZVRpbWluZ3MuZHVyYXRpb247XG4gICAgY29uc3QgaW5uZXJDb250ZXh0ID0gY29udGV4dC5jcmVhdGVTdWJDb250ZXh0KCk7XG4gICAgY29uc3QgaW5uZXJUaW1lbGluZSA9IGlubmVyQ29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgaW5uZXJUaW1lbGluZS5lYXNpbmcgPSBjdXJyZW50QW5pbWF0ZVRpbWluZ3MuZWFzaW5nO1xuXG4gICAgYXN0LnN0eWxlcy5mb3JFYWNoKChzdGVwKSA9PiB7XG4gICAgICBjb25zdCBvZmZzZXQ6IG51bWJlciA9IHN0ZXAub2Zmc2V0IHx8IDA7XG4gICAgICBpbm5lclRpbWVsaW5lLmZvcndhcmRUaW1lKG9mZnNldCAqIGR1cmF0aW9uKTtcbiAgICAgIGlubmVyVGltZWxpbmUuc2V0U3R5bGVzKHN0ZXAuc3R5bGVzLCBzdGVwLmVhc2luZywgY29udGV4dC5lcnJvcnMsIGNvbnRleHQub3B0aW9ucyk7XG4gICAgICBpbm5lclRpbWVsaW5lLmFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gdGhpcyB3aWxsIGVuc3VyZSB0aGF0IHRoZSBwYXJlbnQgdGltZWxpbmUgZ2V0cyBhbGwgdGhlIHN0eWxlcyBmcm9tXG4gICAgLy8gdGhlIGNoaWxkIGV2ZW4gaWYgdGhlIG5ldyB0aW1lbGluZSBiZWxvdyBpcyBub3QgdXNlZFxuICAgIGNvbnRleHQuY3VycmVudFRpbWVsaW5lLm1lcmdlVGltZWxpbmVDb2xsZWN0ZWRTdHlsZXMoaW5uZXJUaW1lbGluZSk7XG5cbiAgICAvLyB3ZSBkbyB0aGlzIGJlY2F1c2UgdGhlIHdpbmRvdyBiZXR3ZWVuIHRoaXMgdGltZWxpbmUgYW5kIHRoZSBzdWIgdGltZWxpbmVcbiAgICAvLyBzaG91bGQgZW5zdXJlIHRoYXQgdGhlIHN0eWxlcyB3aXRoaW4gYXJlIGV4YWN0bHkgdGhlIHNhbWUgYXMgdGhleSB3ZXJlIGJlZm9yZVxuICAgIGNvbnRleHQudHJhbnNmb3JtSW50b05ld1RpbWVsaW5lKHN0YXJ0VGltZSArIGR1cmF0aW9uKTtcbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHZpc2l0UXVlcnkoYXN0OiBRdWVyeUFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgLy8gaW4gdGhlIGV2ZW50IHRoYXQgdGhlIGZpcnN0IHN0ZXAgYmVmb3JlIHRoaXMgaXMgYSBzdHlsZSBzdGVwIHdlIG5lZWRcbiAgICAvLyB0byBlbnN1cmUgdGhlIHN0eWxlcyBhcmUgYXBwbGllZCBiZWZvcmUgdGhlIGNoaWxkcmVuIGFyZSBhbmltYXRlZFxuICAgIGNvbnN0IHN0YXJ0VGltZSA9IGNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lO1xuICAgIGNvbnN0IG9wdGlvbnMgPSAoYXN0Lm9wdGlvbnMgfHwge30pIGFzIEFuaW1hdGlvblF1ZXJ5T3B0aW9ucztcbiAgICBjb25zdCBkZWxheSA9IG9wdGlvbnMuZGVsYXkgPyByZXNvbHZlVGltaW5nVmFsdWUob3B0aW9ucy5kZWxheSkgOiAwO1xuXG4gICAgaWYgKFxuICAgICAgZGVsYXkgJiZcbiAgICAgIChjb250ZXh0LnByZXZpb3VzTm9kZS50eXBlID09PSBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3R5bGUgfHxcbiAgICAgICAgKHN0YXJ0VGltZSA9PSAwICYmIGNvbnRleHQuY3VycmVudFRpbWVsaW5lLmhhc0N1cnJlbnRTdHlsZVByb3BlcnRpZXMoKSkpXG4gICAgKSB7XG4gICAgICBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5zbmFwc2hvdEN1cnJlbnRTdHlsZXMoKTtcbiAgICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gREVGQVVMVF9OT09QX1BSRVZJT1VTX05PREU7XG4gICAgfVxuXG4gICAgbGV0IGZ1cnRoZXN0VGltZSA9IHN0YXJ0VGltZTtcbiAgICBjb25zdCBlbG1zID0gY29udGV4dC5pbnZva2VRdWVyeShcbiAgICAgIGFzdC5zZWxlY3RvcixcbiAgICAgIGFzdC5vcmlnaW5hbFNlbGVjdG9yLFxuICAgICAgYXN0LmxpbWl0LFxuICAgICAgYXN0LmluY2x1ZGVTZWxmLFxuICAgICAgb3B0aW9ucy5vcHRpb25hbCA/IHRydWUgOiBmYWxzZSxcbiAgICAgIGNvbnRleHQuZXJyb3JzLFxuICAgICk7XG5cbiAgICBjb250ZXh0LmN1cnJlbnRRdWVyeVRvdGFsID0gZWxtcy5sZW5ndGg7XG4gICAgbGV0IHNhbWVFbGVtZW50VGltZWxpbmU6IFRpbWVsaW5lQnVpbGRlciB8IG51bGwgPSBudWxsO1xuICAgIGVsbXMuZm9yRWFjaCgoZWxlbWVudCwgaSkgPT4ge1xuICAgICAgY29udGV4dC5jdXJyZW50UXVlcnlJbmRleCA9IGk7XG4gICAgICBjb25zdCBpbm5lckNvbnRleHQgPSBjb250ZXh0LmNyZWF0ZVN1YkNvbnRleHQoYXN0Lm9wdGlvbnMsIGVsZW1lbnQpO1xuICAgICAgaWYgKGRlbGF5KSB7XG4gICAgICAgIGlubmVyQ29udGV4dC5kZWxheU5leHRTdGVwKGRlbGF5KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGVsZW1lbnQgPT09IGNvbnRleHQuZWxlbWVudCkge1xuICAgICAgICBzYW1lRWxlbWVudFRpbWVsaW5lID0gaW5uZXJDb250ZXh0LmN1cnJlbnRUaW1lbGluZTtcbiAgICAgIH1cblxuICAgICAgdmlzaXREc2xOb2RlKHRoaXMsIGFzdC5hbmltYXRpb24sIGlubmVyQ29udGV4dCk7XG5cbiAgICAgIC8vIHRoaXMgaXMgaGVyZSBqdXN0IGluY2FzZSB0aGUgaW5uZXIgc3RlcHMgb25seSBjb250YWluIG9yIGVuZFxuICAgICAgLy8gd2l0aCBhIHN0eWxlKCkgY2FsbCAod2hpY2ggaXMgaGVyZSB0byBzaWduYWwgdGhhdCB0aGlzIGlzIGEgcHJlcGFyYXRvcnlcbiAgICAgIC8vIGNhbGwgdG8gc3R5bGUgYW4gZWxlbWVudCBiZWZvcmUgaXQgaXMgYW5pbWF0ZWQgYWdhaW4pXG4gICAgICBpbm5lckNvbnRleHQuY3VycmVudFRpbWVsaW5lLmFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpO1xuXG4gICAgICBjb25zdCBlbmRUaW1lID0gaW5uZXJDb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZTtcbiAgICAgIGZ1cnRoZXN0VGltZSA9IE1hdGgubWF4KGZ1cnRoZXN0VGltZSwgZW5kVGltZSk7XG4gICAgfSk7XG5cbiAgICBjb250ZXh0LmN1cnJlbnRRdWVyeUluZGV4ID0gMDtcbiAgICBjb250ZXh0LmN1cnJlbnRRdWVyeVRvdGFsID0gMDtcbiAgICBjb250ZXh0LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZShmdXJ0aGVzdFRpbWUpO1xuXG4gICAgaWYgKHNhbWVFbGVtZW50VGltZWxpbmUpIHtcbiAgICAgIGNvbnRleHQuY3VycmVudFRpbWVsaW5lLm1lcmdlVGltZWxpbmVDb2xsZWN0ZWRTdHlsZXMoc2FtZUVsZW1lbnRUaW1lbGluZSk7XG4gICAgICBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5zbmFwc2hvdEN1cnJlbnRTdHlsZXMoKTtcbiAgICB9XG5cbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHZpc2l0U3RhZ2dlcihhc3Q6IFN0YWdnZXJBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCkge1xuICAgIGNvbnN0IHBhcmVudENvbnRleHQgPSBjb250ZXh0LnBhcmVudENvbnRleHQhO1xuICAgIGNvbnN0IHRsID0gY29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgY29uc3QgdGltaW5ncyA9IGFzdC50aW1pbmdzO1xuICAgIGNvbnN0IGR1cmF0aW9uID0gTWF0aC5hYnModGltaW5ncy5kdXJhdGlvbik7XG4gICAgY29uc3QgbWF4VGltZSA9IGR1cmF0aW9uICogKGNvbnRleHQuY3VycmVudFF1ZXJ5VG90YWwgLSAxKTtcbiAgICBsZXQgZGVsYXkgPSBkdXJhdGlvbiAqIGNvbnRleHQuY3VycmVudFF1ZXJ5SW5kZXg7XG5cbiAgICBsZXQgc3RhZ2dlclRyYW5zZm9ybWVyID0gdGltaW5ncy5kdXJhdGlvbiA8IDAgPyAncmV2ZXJzZScgOiB0aW1pbmdzLmVhc2luZztcbiAgICBzd2l0Y2ggKHN0YWdnZXJUcmFuc2Zvcm1lcikge1xuICAgICAgY2FzZSAncmV2ZXJzZSc6XG4gICAgICAgIGRlbGF5ID0gbWF4VGltZSAtIGRlbGF5O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Z1bGwnOlxuICAgICAgICBkZWxheSA9IHBhcmVudENvbnRleHQuY3VycmVudFN0YWdnZXJUaW1lO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCB0aW1lbGluZSA9IGNvbnRleHQuY3VycmVudFRpbWVsaW5lO1xuICAgIGlmIChkZWxheSkge1xuICAgICAgdGltZWxpbmUuZGVsYXlOZXh0U3RlcChkZWxheSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhcnRpbmdUaW1lID0gdGltZWxpbmUuY3VycmVudFRpbWU7XG4gICAgdmlzaXREc2xOb2RlKHRoaXMsIGFzdC5hbmltYXRpb24sIGNvbnRleHQpO1xuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuXG4gICAgLy8gdGltZSA9IGR1cmF0aW9uICsgZGVsYXlcbiAgICAvLyB0aGUgcmVhc29uIHdoeSB0aGlzIGNvbXB1dGF0aW9uIGlzIHNvIGNvbXBsZXggaXMgYmVjYXVzZVxuICAgIC8vIHRoZSBpbm5lciB0aW1lbGluZSBtYXkgZWl0aGVyIGhhdmUgYSBkZWxheSB2YWx1ZSBvciBhIHN0cmV0Y2hlZFxuICAgIC8vIGtleWZyYW1lIGRlcGVuZGluZyBvbiBpZiBhIHN1YnRpbWVsaW5lIGlzIG5vdCB1c2VkIG9yIGlzIHVzZWQuXG4gICAgcGFyZW50Q29udGV4dC5jdXJyZW50U3RhZ2dlclRpbWUgPVxuICAgICAgdGwuY3VycmVudFRpbWUgLSBzdGFydGluZ1RpbWUgKyAodGwuc3RhcnRUaW1lIC0gcGFyZW50Q29udGV4dC5jdXJyZW50VGltZWxpbmUuc3RhcnRUaW1lKTtcbiAgfVxufVxuXG5leHBvcnQgZGVjbGFyZSB0eXBlIFN0eWxlQXRUaW1lID0ge1xuICB0aW1lOiBudW1iZXI7XG4gIHZhbHVlOiBzdHJpbmcgfCBudW1iZXI7XG59O1xuXG5jb25zdCBERUZBVUxUX05PT1BfUFJFVklPVVNfTk9ERSA9IDxBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPj57fTtcbmV4cG9ydCBjbGFzcyBBbmltYXRpb25UaW1lbGluZUNvbnRleHQge1xuICBwdWJsaWMgcGFyZW50Q29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0IHwgbnVsbCA9IG51bGw7XG4gIHB1YmxpYyBjdXJyZW50VGltZWxpbmU6IFRpbWVsaW5lQnVpbGRlcjtcbiAgcHVibGljIGN1cnJlbnRBbmltYXRlVGltaW5nczogQW5pbWF0ZVRpbWluZ3MgfCBudWxsID0gbnVsbDtcbiAgcHVibGljIHByZXZpb3VzTm9kZTogQXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZT4gPSBERUZBVUxUX05PT1BfUFJFVklPVVNfTk9ERTtcbiAgcHVibGljIHN1YkNvbnRleHRDb3VudCA9IDA7XG4gIHB1YmxpYyBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zID0ge307XG4gIHB1YmxpYyBjdXJyZW50UXVlcnlJbmRleDogbnVtYmVyID0gMDtcbiAgcHVibGljIGN1cnJlbnRRdWVyeVRvdGFsOiBudW1iZXIgPSAwO1xuICBwdWJsaWMgY3VycmVudFN0YWdnZXJUaW1lOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2RyaXZlcjogQW5pbWF0aW9uRHJpdmVyLFxuICAgIHB1YmxpYyBlbGVtZW50OiBhbnksXG4gICAgcHVibGljIHN1Ykluc3RydWN0aW9uczogRWxlbWVudEluc3RydWN0aW9uTWFwLFxuICAgIHByaXZhdGUgX2VudGVyQ2xhc3NOYW1lOiBzdHJpbmcsXG4gICAgcHJpdmF0ZSBfbGVhdmVDbGFzc05hbWU6IHN0cmluZyxcbiAgICBwdWJsaWMgZXJyb3JzOiBFcnJvcltdLFxuICAgIHB1YmxpYyB0aW1lbGluZXM6IFRpbWVsaW5lQnVpbGRlcltdLFxuICAgIGluaXRpYWxUaW1lbGluZT86IFRpbWVsaW5lQnVpbGRlcixcbiAgKSB7XG4gICAgdGhpcy5jdXJyZW50VGltZWxpbmUgPSBpbml0aWFsVGltZWxpbmUgfHwgbmV3IFRpbWVsaW5lQnVpbGRlcih0aGlzLl9kcml2ZXIsIGVsZW1lbnQsIDApO1xuICAgIHRpbWVsaW5lcy5wdXNoKHRoaXMuY3VycmVudFRpbWVsaW5lKTtcbiAgfVxuXG4gIGdldCBwYXJhbXMoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5wYXJhbXM7XG4gIH1cblxuICB1cGRhdGVPcHRpb25zKG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgfCBudWxsLCBza2lwSWZFeGlzdHM/OiBib29sZWFuKSB7XG4gICAgaWYgKCFvcHRpb25zKSByZXR1cm47XG5cbiAgICBjb25zdCBuZXdPcHRpb25zID0gb3B0aW9ucyBhcyBhbnk7XG4gICAgbGV0IG9wdGlvbnNUb1VwZGF0ZSA9IHRoaXMub3B0aW9ucztcblxuICAgIC8vIE5PVEU6IHRoaXMgd2lsbCBnZXQgcGF0Y2hlZCB1cCB3aGVuIG90aGVyIGFuaW1hdGlvbiBtZXRob2RzIHN1cHBvcnQgZHVyYXRpb24gb3ZlcnJpZGVzXG4gICAgaWYgKG5ld09wdGlvbnMuZHVyYXRpb24gIT0gbnVsbCkge1xuICAgICAgKG9wdGlvbnNUb1VwZGF0ZSBhcyBhbnkpLmR1cmF0aW9uID0gcmVzb2x2ZVRpbWluZ1ZhbHVlKG5ld09wdGlvbnMuZHVyYXRpb24pO1xuICAgIH1cblxuICAgIGlmIChuZXdPcHRpb25zLmRlbGF5ICE9IG51bGwpIHtcbiAgICAgIG9wdGlvbnNUb1VwZGF0ZS5kZWxheSA9IHJlc29sdmVUaW1pbmdWYWx1ZShuZXdPcHRpb25zLmRlbGF5KTtcbiAgICB9XG5cbiAgICBjb25zdCBuZXdQYXJhbXMgPSBuZXdPcHRpb25zLnBhcmFtcztcbiAgICBpZiAobmV3UGFyYW1zKSB7XG4gICAgICBsZXQgcGFyYW1zVG9VcGRhdGU6IHtbbmFtZTogc3RyaW5nXTogYW55fSA9IG9wdGlvbnNUb1VwZGF0ZS5wYXJhbXMhO1xuICAgICAgaWYgKCFwYXJhbXNUb1VwZGF0ZSkge1xuICAgICAgICBwYXJhbXNUb1VwZGF0ZSA9IHRoaXMub3B0aW9ucy5wYXJhbXMgPSB7fTtcbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmtleXMobmV3UGFyYW1zKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgIGlmICghc2tpcElmRXhpc3RzIHx8ICFwYXJhbXNUb1VwZGF0ZS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgIHBhcmFtc1RvVXBkYXRlW25hbWVdID0gaW50ZXJwb2xhdGVQYXJhbXMobmV3UGFyYW1zW25hbWVdLCBwYXJhbXNUb1VwZGF0ZSwgdGhpcy5lcnJvcnMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jb3B5T3B0aW9ucygpIHtcbiAgICBjb25zdCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zID0ge307XG4gICAgaWYgKHRoaXMub3B0aW9ucykge1xuICAgICAgY29uc3Qgb2xkUGFyYW1zID0gdGhpcy5vcHRpb25zLnBhcmFtcztcbiAgICAgIGlmIChvbGRQYXJhbXMpIHtcbiAgICAgICAgY29uc3QgcGFyYW1zOiB7W25hbWU6IHN0cmluZ106IGFueX0gPSAob3B0aW9uc1sncGFyYW1zJ10gPSB7fSk7XG4gICAgICAgIE9iamVjdC5rZXlzKG9sZFBhcmFtcykuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgICAgIHBhcmFtc1tuYW1lXSA9IG9sZFBhcmFtc1tuYW1lXTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvcHRpb25zO1xuICB9XG5cbiAgY3JlYXRlU3ViQ29udGV4dChcbiAgICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwsXG4gICAgZWxlbWVudD86IGFueSxcbiAgICBuZXdUaW1lPzogbnVtYmVyLFxuICApOiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQge1xuICAgIGNvbnN0IHRhcmdldCA9IGVsZW1lbnQgfHwgdGhpcy5lbGVtZW50O1xuICAgIGNvbnN0IGNvbnRleHQgPSBuZXcgQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KFxuICAgICAgdGhpcy5fZHJpdmVyLFxuICAgICAgdGFyZ2V0LFxuICAgICAgdGhpcy5zdWJJbnN0cnVjdGlvbnMsXG4gICAgICB0aGlzLl9lbnRlckNsYXNzTmFtZSxcbiAgICAgIHRoaXMuX2xlYXZlQ2xhc3NOYW1lLFxuICAgICAgdGhpcy5lcnJvcnMsXG4gICAgICB0aGlzLnRpbWVsaW5lcyxcbiAgICAgIHRoaXMuY3VycmVudFRpbWVsaW5lLmZvcmsodGFyZ2V0LCBuZXdUaW1lIHx8IDApLFxuICAgICk7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSB0aGlzLnByZXZpb3VzTm9kZTtcbiAgICBjb250ZXh0LmN1cnJlbnRBbmltYXRlVGltaW5ncyA9IHRoaXMuY3VycmVudEFuaW1hdGVUaW1pbmdzO1xuXG4gICAgY29udGV4dC5vcHRpb25zID0gdGhpcy5fY29weU9wdGlvbnMoKTtcbiAgICBjb250ZXh0LnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICBjb250ZXh0LmN1cnJlbnRRdWVyeUluZGV4ID0gdGhpcy5jdXJyZW50UXVlcnlJbmRleDtcbiAgICBjb250ZXh0LmN1cnJlbnRRdWVyeVRvdGFsID0gdGhpcy5jdXJyZW50UXVlcnlUb3RhbDtcbiAgICBjb250ZXh0LnBhcmVudENvbnRleHQgPSB0aGlzO1xuICAgIHRoaXMuc3ViQ29udGV4dENvdW50Kys7XG4gICAgcmV0dXJuIGNvbnRleHQ7XG4gIH1cblxuICB0cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUobmV3VGltZT86IG51bWJlcikge1xuICAgIHRoaXMucHJldmlvdXNOb2RlID0gREVGQVVMVF9OT09QX1BSRVZJT1VTX05PREU7XG4gICAgdGhpcy5jdXJyZW50VGltZWxpbmUgPSB0aGlzLmN1cnJlbnRUaW1lbGluZS5mb3JrKHRoaXMuZWxlbWVudCwgbmV3VGltZSk7XG4gICAgdGhpcy50aW1lbGluZXMucHVzaCh0aGlzLmN1cnJlbnRUaW1lbGluZSk7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFRpbWVsaW5lO1xuICB9XG5cbiAgYXBwZW5kSW5zdHJ1Y3Rpb25Ub1RpbWVsaW5lKFxuICAgIGluc3RydWN0aW9uOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uLFxuICAgIGR1cmF0aW9uOiBudW1iZXIgfCBudWxsLFxuICAgIGRlbGF5OiBudW1iZXIgfCBudWxsLFxuICApOiBBbmltYXRlVGltaW5ncyB7XG4gICAgY29uc3QgdXBkYXRlZFRpbWluZ3M6IEFuaW1hdGVUaW1pbmdzID0ge1xuICAgICAgZHVyYXRpb246IGR1cmF0aW9uICE9IG51bGwgPyBkdXJhdGlvbiA6IGluc3RydWN0aW9uLmR1cmF0aW9uLFxuICAgICAgZGVsYXk6IHRoaXMuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lICsgKGRlbGF5ICE9IG51bGwgPyBkZWxheSA6IDApICsgaW5zdHJ1Y3Rpb24uZGVsYXksXG4gICAgICBlYXNpbmc6ICcnLFxuICAgIH07XG4gICAgY29uc3QgYnVpbGRlciA9IG5ldyBTdWJUaW1lbGluZUJ1aWxkZXIoXG4gICAgICB0aGlzLl9kcml2ZXIsXG4gICAgICBpbnN0cnVjdGlvbi5lbGVtZW50LFxuICAgICAgaW5zdHJ1Y3Rpb24ua2V5ZnJhbWVzLFxuICAgICAgaW5zdHJ1Y3Rpb24ucHJlU3R5bGVQcm9wcyxcbiAgICAgIGluc3RydWN0aW9uLnBvc3RTdHlsZVByb3BzLFxuICAgICAgdXBkYXRlZFRpbWluZ3MsXG4gICAgICBpbnN0cnVjdGlvbi5zdHJldGNoU3RhcnRpbmdLZXlmcmFtZSxcbiAgICApO1xuICAgIHRoaXMudGltZWxpbmVzLnB1c2goYnVpbGRlcik7XG4gICAgcmV0dXJuIHVwZGF0ZWRUaW1pbmdzO1xuICB9XG5cbiAgaW5jcmVtZW50VGltZSh0aW1lOiBudW1iZXIpIHtcbiAgICB0aGlzLmN1cnJlbnRUaW1lbGluZS5mb3J3YXJkVGltZSh0aGlzLmN1cnJlbnRUaW1lbGluZS5kdXJhdGlvbiArIHRpbWUpO1xuICB9XG5cbiAgZGVsYXlOZXh0U3RlcChkZWxheTogbnVtYmVyKSB7XG4gICAgLy8gbmVnYXRpdmUgZGVsYXlzIGFyZSBub3QgeWV0IHN1cHBvcnRlZFxuICAgIGlmIChkZWxheSA+IDApIHtcbiAgICAgIHRoaXMuY3VycmVudFRpbWVsaW5lLmRlbGF5TmV4dFN0ZXAoZGVsYXkpO1xuICAgIH1cbiAgfVxuXG4gIGludm9rZVF1ZXJ5KFxuICAgIHNlbGVjdG9yOiBzdHJpbmcsXG4gICAgb3JpZ2luYWxTZWxlY3Rvcjogc3RyaW5nLFxuICAgIGxpbWl0OiBudW1iZXIsXG4gICAgaW5jbHVkZVNlbGY6IGJvb2xlYW4sXG4gICAgb3B0aW9uYWw6IGJvb2xlYW4sXG4gICAgZXJyb3JzOiBFcnJvcltdLFxuICApOiBhbnlbXSB7XG4gICAgbGV0IHJlc3VsdHM6IGFueVtdID0gW107XG4gICAgaWYgKGluY2x1ZGVTZWxmKSB7XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5lbGVtZW50KTtcbiAgICB9XG4gICAgaWYgKHNlbGVjdG9yLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIG9ubHkgaWYgOnNlbGYgaXMgdXNlZCB0aGVuIHRoZSBzZWxlY3RvciBjYW4gYmUgZW1wdHlcbiAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShFTlRFUl9UT0tFTl9SRUdFWCwgJy4nICsgdGhpcy5fZW50ZXJDbGFzc05hbWUpO1xuICAgICAgc2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKExFQVZFX1RPS0VOX1JFR0VYLCAnLicgKyB0aGlzLl9sZWF2ZUNsYXNzTmFtZSk7XG4gICAgICBjb25zdCBtdWx0aSA9IGxpbWl0ICE9IDE7XG4gICAgICBsZXQgZWxlbWVudHMgPSB0aGlzLl9kcml2ZXIucXVlcnkodGhpcy5lbGVtZW50LCBzZWxlY3RvciwgbXVsdGkpO1xuICAgICAgaWYgKGxpbWl0ICE9PSAwKSB7XG4gICAgICAgIGVsZW1lbnRzID1cbiAgICAgICAgICBsaW1pdCA8IDBcbiAgICAgICAgICAgID8gZWxlbWVudHMuc2xpY2UoZWxlbWVudHMubGVuZ3RoICsgbGltaXQsIGVsZW1lbnRzLmxlbmd0aClcbiAgICAgICAgICAgIDogZWxlbWVudHMuc2xpY2UoMCwgbGltaXQpO1xuICAgICAgfVxuICAgICAgcmVzdWx0cy5wdXNoKC4uLmVsZW1lbnRzKTtcbiAgICB9XG5cbiAgICBpZiAoIW9wdGlvbmFsICYmIHJlc3VsdHMubGVuZ3RoID09IDApIHtcbiAgICAgIGVycm9ycy5wdXNoKGludmFsaWRRdWVyeShvcmlnaW5hbFNlbGVjdG9yKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUaW1lbGluZUJ1aWxkZXIge1xuICBwdWJsaWMgZHVyYXRpb246IG51bWJlciA9IDA7XG4gIHB1YmxpYyBlYXNpbmc6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9wcmV2aW91c0tleWZyYW1lOiDJtVN0eWxlRGF0YU1hcCA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBfY3VycmVudEtleWZyYW1lOiDJtVN0eWxlRGF0YU1hcCA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBfa2V5ZnJhbWVzID0gbmV3IE1hcDxudW1iZXIsIMm1U3R5bGVEYXRhTWFwPigpO1xuICBwcml2YXRlIF9zdHlsZVN1bW1hcnkgPSBuZXcgTWFwPHN0cmluZywgU3R5bGVBdFRpbWU+KCk7XG4gIHByaXZhdGUgX2xvY2FsVGltZWxpbmVTdHlsZXM6IMm1U3R5bGVEYXRhTWFwID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIF9nbG9iYWxUaW1lbGluZVN0eWxlczogybVTdHlsZURhdGFNYXA7XG4gIHByaXZhdGUgX3BlbmRpbmdTdHlsZXM6IMm1U3R5bGVEYXRhTWFwID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIF9iYWNrRmlsbDogybVTdHlsZURhdGFNYXAgPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgX2N1cnJlbnRFbXB0eVN0ZXBLZXlmcmFtZTogybVTdHlsZURhdGFNYXAgfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9kcml2ZXI6IEFuaW1hdGlvbkRyaXZlcixcbiAgICBwdWJsaWMgZWxlbWVudDogYW55LFxuICAgIHB1YmxpYyBzdGFydFRpbWU6IG51bWJlcixcbiAgICBwcml2YXRlIF9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXA/OiBNYXA8YW55LCDJtVN0eWxlRGF0YU1hcD4sXG4gICkge1xuICAgIGlmICghdGhpcy5fZWxlbWVudFRpbWVsaW5lU3R5bGVzTG9va3VwKSB7XG4gICAgICB0aGlzLl9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXAgPSBuZXcgTWFwPGFueSwgybVTdHlsZURhdGFNYXA+KCk7XG4gICAgfVxuXG4gICAgdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXMgPSB0aGlzLl9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXAuZ2V0KGVsZW1lbnQpITtcbiAgICBpZiAoIXRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzKSB7XG4gICAgICB0aGlzLl9nbG9iYWxUaW1lbGluZVN0eWxlcyA9IHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXM7XG4gICAgICB0aGlzLl9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXAuc2V0KGVsZW1lbnQsIHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXMpO1xuICAgIH1cbiAgICB0aGlzLl9sb2FkS2V5ZnJhbWUoKTtcbiAgfVxuXG4gIGNvbnRhaW5zQW5pbWF0aW9uKCk6IGJvb2xlYW4ge1xuICAgIHN3aXRjaCAodGhpcy5fa2V5ZnJhbWVzLnNpemUpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gdGhpcy5oYXNDdXJyZW50U3R5bGVQcm9wZXJ0aWVzKCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBoYXNDdXJyZW50U3R5bGVQcm9wZXJ0aWVzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50S2V5ZnJhbWUuc2l6ZSA+IDA7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhcnRUaW1lICsgdGhpcy5kdXJhdGlvbjtcbiAgfVxuXG4gIGRlbGF5TmV4dFN0ZXAoZGVsYXk6IG51bWJlcikge1xuICAgIC8vIGluIHRoZSBldmVudCB0aGF0IGEgc3R5bGUoKSBzdGVwIGlzIHBsYWNlZCByaWdodCBiZWZvcmUgYSBzdGFnZ2VyKClcbiAgICAvLyBhbmQgdGhhdCBzdHlsZSgpIHN0ZXAgaXMgdGhlIHZlcnkgZmlyc3Qgc3R5bGUoKSB2YWx1ZSBpbiB0aGUgYW5pbWF0aW9uXG4gICAgLy8gdGhlbiB3ZSBuZWVkIHRvIG1ha2UgYSBjb3B5IG9mIHRoZSBrZXlmcmFtZSBbMCwgY29weSwgMV0gc28gdGhhdCB0aGUgZGVsYXlcbiAgICAvLyBwcm9wZXJseSBhcHBsaWVzIHRoZSBzdHlsZSgpIHZhbHVlcyB0byB3b3JrIHdpdGggdGhlIHN0YWdnZXIuLi5cbiAgICBjb25zdCBoYXNQcmVTdHlsZVN0ZXAgPSB0aGlzLl9rZXlmcmFtZXMuc2l6ZSA9PT0gMSAmJiB0aGlzLl9wZW5kaW5nU3R5bGVzLnNpemU7XG5cbiAgICBpZiAodGhpcy5kdXJhdGlvbiB8fCBoYXNQcmVTdHlsZVN0ZXApIHtcbiAgICAgIHRoaXMuZm9yd2FyZFRpbWUodGhpcy5jdXJyZW50VGltZSArIGRlbGF5KTtcbiAgICAgIGlmIChoYXNQcmVTdHlsZVN0ZXApIHtcbiAgICAgICAgdGhpcy5zbmFwc2hvdEN1cnJlbnRTdHlsZXMoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGFydFRpbWUgKz0gZGVsYXk7XG4gICAgfVxuICB9XG5cbiAgZm9yayhlbGVtZW50OiBhbnksIGN1cnJlbnRUaW1lPzogbnVtYmVyKTogVGltZWxpbmVCdWlsZGVyIHtcbiAgICB0aGlzLmFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpO1xuICAgIHJldHVybiBuZXcgVGltZWxpbmVCdWlsZGVyKFxuICAgICAgdGhpcy5fZHJpdmVyLFxuICAgICAgZWxlbWVudCxcbiAgICAgIGN1cnJlbnRUaW1lIHx8IHRoaXMuY3VycmVudFRpbWUsXG4gICAgICB0aGlzLl9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXAsXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgX2xvYWRLZXlmcmFtZSgpIHtcbiAgICBpZiAodGhpcy5fY3VycmVudEtleWZyYW1lKSB7XG4gICAgICB0aGlzLl9wcmV2aW91c0tleWZyYW1lID0gdGhpcy5fY3VycmVudEtleWZyYW1lO1xuICAgIH1cbiAgICB0aGlzLl9jdXJyZW50S2V5ZnJhbWUgPSB0aGlzLl9rZXlmcmFtZXMuZ2V0KHRoaXMuZHVyYXRpb24pITtcbiAgICBpZiAoIXRoaXMuX2N1cnJlbnRLZXlmcmFtZSkge1xuICAgICAgdGhpcy5fY3VycmVudEtleWZyYW1lID0gbmV3IE1hcCgpO1xuICAgICAgdGhpcy5fa2V5ZnJhbWVzLnNldCh0aGlzLmR1cmF0aW9uLCB0aGlzLl9jdXJyZW50S2V5ZnJhbWUpO1xuICAgIH1cbiAgfVxuXG4gIGZvcndhcmRGcmFtZSgpIHtcbiAgICB0aGlzLmR1cmF0aW9uICs9IE9ORV9GUkFNRV9JTl9NSUxMSVNFQ09ORFM7XG4gICAgdGhpcy5fbG9hZEtleWZyYW1lKCk7XG4gIH1cblxuICBmb3J3YXJkVGltZSh0aW1lOiBudW1iZXIpIHtcbiAgICB0aGlzLmFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpO1xuICAgIHRoaXMuZHVyYXRpb24gPSB0aW1lO1xuICAgIHRoaXMuX2xvYWRLZXlmcmFtZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlU3R5bGUocHJvcDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyKSB7XG4gICAgdGhpcy5fbG9jYWxUaW1lbGluZVN0eWxlcy5zZXQocHJvcCwgdmFsdWUpO1xuICAgIHRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzLnNldChwcm9wLCB2YWx1ZSk7XG4gICAgdGhpcy5fc3R5bGVTdW1tYXJ5LnNldChwcm9wLCB7dGltZTogdGhpcy5jdXJyZW50VGltZSwgdmFsdWV9KTtcbiAgfVxuXG4gIGFsbG93T25seVRpbWVsaW5lU3R5bGVzKCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50RW1wdHlTdGVwS2V5ZnJhbWUgIT09IHRoaXMuX2N1cnJlbnRLZXlmcmFtZTtcbiAgfVxuXG4gIGFwcGx5RW1wdHlTdGVwKGVhc2luZzogc3RyaW5nIHwgbnVsbCkge1xuICAgIGlmIChlYXNpbmcpIHtcbiAgICAgIHRoaXMuX3ByZXZpb3VzS2V5ZnJhbWUuc2V0KCdlYXNpbmcnLCBlYXNpbmcpO1xuICAgIH1cblxuICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgYW5pbWF0ZShkdXJhdGlvbik6XG4gICAgLy8gYWxsIG1pc3Npbmcgc3R5bGVzIGFyZSBmaWxsZWQgd2l0aCBhIGAqYCB2YWx1ZSB0aGVuXG4gICAgLy8gaWYgYW55IGRlc3RpbmF0aW9uIHN0eWxlcyBhcmUgZmlsbGVkIGluIGxhdGVyIG9uIHRoZSBzYW1lXG4gICAgLy8ga2V5ZnJhbWUgdGhlbiB0aGV5IHdpbGwgb3ZlcnJpZGUgdGhlIG92ZXJyaWRkZW4gc3R5bGVzXG4gICAgLy8gV2UgdXNlIGBfZ2xvYmFsVGltZWxpbmVTdHlsZXNgIGhlcmUgYmVjYXVzZSB0aGVyZSBtYXkgYmVcbiAgICAvLyBzdHlsZXMgaW4gcHJldmlvdXMga2V5ZnJhbWVzIHRoYXQgYXJlIG5vdCBwcmVzZW50IGluIHRoaXMgdGltZWxpbmVcbiAgICBmb3IgKGxldCBbcHJvcCwgdmFsdWVdIG9mIHRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzKSB7XG4gICAgICB0aGlzLl9iYWNrRmlsbC5zZXQocHJvcCwgdmFsdWUgfHwgQVVUT19TVFlMRSk7XG4gICAgICB0aGlzLl9jdXJyZW50S2V5ZnJhbWUuc2V0KHByb3AsIEFVVE9fU1RZTEUpO1xuICAgIH1cbiAgICB0aGlzLl9jdXJyZW50RW1wdHlTdGVwS2V5ZnJhbWUgPSB0aGlzLl9jdXJyZW50S2V5ZnJhbWU7XG4gIH1cblxuICBzZXRTdHlsZXMoXG4gICAgaW5wdXQ6IEFycmF5PMm1U3R5bGVEYXRhTWFwIHwgc3RyaW5nPixcbiAgICBlYXNpbmc6IHN0cmluZyB8IG51bGwsXG4gICAgZXJyb3JzOiBFcnJvcltdLFxuICAgIG9wdGlvbnM/OiBBbmltYXRpb25PcHRpb25zLFxuICApIHtcbiAgICBpZiAoZWFzaW5nKSB7XG4gICAgICB0aGlzLl9wcmV2aW91c0tleWZyYW1lLnNldCgnZWFzaW5nJywgZWFzaW5nKTtcbiAgICB9XG4gICAgY29uc3QgcGFyYW1zID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5wYXJhbXMpIHx8IHt9O1xuICAgIGNvbnN0IHN0eWxlcyA9IGZsYXR0ZW5TdHlsZXMoaW5wdXQsIHRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzKTtcbiAgICBmb3IgKGxldCBbcHJvcCwgdmFsdWVdIG9mIHN0eWxlcykge1xuICAgICAgY29uc3QgdmFsID0gaW50ZXJwb2xhdGVQYXJhbXModmFsdWUsIHBhcmFtcywgZXJyb3JzKTtcbiAgICAgIHRoaXMuX3BlbmRpbmdTdHlsZXMuc2V0KHByb3AsIHZhbCk7XG4gICAgICBpZiAoIXRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXMuaGFzKHByb3ApKSB7XG4gICAgICAgIHRoaXMuX2JhY2tGaWxsLnNldChwcm9wLCB0aGlzLl9nbG9iYWxUaW1lbGluZVN0eWxlcy5nZXQocHJvcCkgPz8gQVVUT19TVFlMRSk7XG4gICAgICB9XG4gICAgICB0aGlzLl91cGRhdGVTdHlsZShwcm9wLCB2YWwpO1xuICAgIH1cbiAgfVxuXG4gIGFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpIHtcbiAgICBpZiAodGhpcy5fcGVuZGluZ1N0eWxlcy5zaXplID09IDApIHJldHVybjtcblxuICAgIHRoaXMuX3BlbmRpbmdTdHlsZXMuZm9yRWFjaCgodmFsLCBwcm9wKSA9PiB7XG4gICAgICB0aGlzLl9jdXJyZW50S2V5ZnJhbWUuc2V0KHByb3AsIHZhbCk7XG4gICAgfSk7XG4gICAgdGhpcy5fcGVuZGluZ1N0eWxlcy5jbGVhcigpO1xuXG4gICAgdGhpcy5fbG9jYWxUaW1lbGluZVN0eWxlcy5mb3JFYWNoKCh2YWwsIHByb3ApID0+IHtcbiAgICAgIGlmICghdGhpcy5fY3VycmVudEtleWZyYW1lLmhhcyhwcm9wKSkge1xuICAgICAgICB0aGlzLl9jdXJyZW50S2V5ZnJhbWUuc2V0KHByb3AsIHZhbCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzbmFwc2hvdEN1cnJlbnRTdHlsZXMoKSB7XG4gICAgZm9yIChsZXQgW3Byb3AsIHZhbF0gb2YgdGhpcy5fbG9jYWxUaW1lbGluZVN0eWxlcykge1xuICAgICAgdGhpcy5fcGVuZGluZ1N0eWxlcy5zZXQocHJvcCwgdmFsKTtcbiAgICAgIHRoaXMuX3VwZGF0ZVN0eWxlKHByb3AsIHZhbCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0RmluYWxLZXlmcmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fa2V5ZnJhbWVzLmdldCh0aGlzLmR1cmF0aW9uKTtcbiAgfVxuXG4gIGdldCBwcm9wZXJ0aWVzKCkge1xuICAgIGNvbnN0IHByb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG4gICAgZm9yIChsZXQgcHJvcCBpbiB0aGlzLl9jdXJyZW50S2V5ZnJhbWUpIHtcbiAgICAgIHByb3BlcnRpZXMucHVzaChwcm9wKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb3BlcnRpZXM7XG4gIH1cblxuICBtZXJnZVRpbWVsaW5lQ29sbGVjdGVkU3R5bGVzKHRpbWVsaW5lOiBUaW1lbGluZUJ1aWxkZXIpIHtcbiAgICB0aW1lbGluZS5fc3R5bGVTdW1tYXJ5LmZvckVhY2goKGRldGFpbHMxLCBwcm9wKSA9PiB7XG4gICAgICBjb25zdCBkZXRhaWxzMCA9IHRoaXMuX3N0eWxlU3VtbWFyeS5nZXQocHJvcCk7XG4gICAgICBpZiAoIWRldGFpbHMwIHx8IGRldGFpbHMxLnRpbWUgPiBkZXRhaWxzMC50aW1lKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0eWxlKHByb3AsIGRldGFpbHMxLnZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGJ1aWxkS2V5ZnJhbWVzKCk6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb24ge1xuICAgIHRoaXMuYXBwbHlTdHlsZXNUb0tleWZyYW1lKCk7XG4gICAgY29uc3QgcHJlU3R5bGVQcm9wcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGNvbnN0IHBvc3RTdHlsZVByb3BzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3QgaXNFbXB0eSA9IHRoaXMuX2tleWZyYW1lcy5zaXplID09PSAxICYmIHRoaXMuZHVyYXRpb24gPT09IDA7XG5cbiAgICBsZXQgZmluYWxLZXlmcmFtZXM6IEFycmF5PMm1U3R5bGVEYXRhTWFwPiA9IFtdO1xuICAgIHRoaXMuX2tleWZyYW1lcy5mb3JFYWNoKChrZXlmcmFtZSwgdGltZSkgPT4ge1xuICAgICAgY29uc3QgZmluYWxLZXlmcmFtZSA9IG5ldyBNYXAoWy4uLnRoaXMuX2JhY2tGaWxsLCAuLi5rZXlmcmFtZV0pO1xuICAgICAgZmluYWxLZXlmcmFtZS5mb3JFYWNoKCh2YWx1ZSwgcHJvcCkgPT4ge1xuICAgICAgICBpZiAodmFsdWUgPT09IFBSRV9TVFlMRSkge1xuICAgICAgICAgIHByZVN0eWxlUHJvcHMuYWRkKHByb3ApO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBBVVRPX1NUWUxFKSB7XG4gICAgICAgICAgcG9zdFN0eWxlUHJvcHMuYWRkKHByb3ApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmICghaXNFbXB0eSkge1xuICAgICAgICBmaW5hbEtleWZyYW1lLnNldCgnb2Zmc2V0JywgdGltZSAvIHRoaXMuZHVyYXRpb24pO1xuICAgICAgfVxuICAgICAgZmluYWxLZXlmcmFtZXMucHVzaChmaW5hbEtleWZyYW1lKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHByZVByb3BzOiBzdHJpbmdbXSA9IFsuLi5wcmVTdHlsZVByb3BzLnZhbHVlcygpXTtcbiAgICBjb25zdCBwb3N0UHJvcHM6IHN0cmluZ1tdID0gWy4uLnBvc3RTdHlsZVByb3BzLnZhbHVlcygpXTtcblxuICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgYSAwLXNlY29uZCBhbmltYXRpb24gKHdoaWNoIGlzIGRlc2lnbmVkIGp1c3QgdG8gcGxhY2Ugc3R5bGVzIG9uc2NyZWVuKVxuICAgIGlmIChpc0VtcHR5KSB7XG4gICAgICBjb25zdCBrZjAgPSBmaW5hbEtleWZyYW1lc1swXTtcbiAgICAgIGNvbnN0IGtmMSA9IG5ldyBNYXAoa2YwKTtcbiAgICAgIGtmMC5zZXQoJ29mZnNldCcsIDApO1xuICAgICAga2YxLnNldCgnb2Zmc2V0JywgMSk7XG4gICAgICBmaW5hbEtleWZyYW1lcyA9IFtrZjAsIGtmMV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGNyZWF0ZVRpbWVsaW5lSW5zdHJ1Y3Rpb24oXG4gICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICBmaW5hbEtleWZyYW1lcyxcbiAgICAgIHByZVByb3BzLFxuICAgICAgcG9zdFByb3BzLFxuICAgICAgdGhpcy5kdXJhdGlvbixcbiAgICAgIHRoaXMuc3RhcnRUaW1lLFxuICAgICAgdGhpcy5lYXNpbmcsXG4gICAgICBmYWxzZSxcbiAgICApO1xuICB9XG59XG5cbmNsYXNzIFN1YlRpbWVsaW5lQnVpbGRlciBleHRlbmRzIFRpbWVsaW5lQnVpbGRlciB7XG4gIHB1YmxpYyB0aW1pbmdzOiBBbmltYXRlVGltaW5ncztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlcixcbiAgICBlbGVtZW50OiBhbnksXG4gICAgcHVibGljIGtleWZyYW1lczogQXJyYXk8ybVTdHlsZURhdGFNYXA+LFxuICAgIHB1YmxpYyBwcmVTdHlsZVByb3BzOiBzdHJpbmdbXSxcbiAgICBwdWJsaWMgcG9zdFN0eWxlUHJvcHM6IHN0cmluZ1tdLFxuICAgIHRpbWluZ3M6IEFuaW1hdGVUaW1pbmdzLFxuICAgIHByaXZhdGUgX3N0cmV0Y2hTdGFydGluZ0tleWZyYW1lOiBib29sZWFuID0gZmFsc2UsXG4gICkge1xuICAgIHN1cGVyKGRyaXZlciwgZWxlbWVudCwgdGltaW5ncy5kZWxheSk7XG4gICAgdGhpcy50aW1pbmdzID0ge2R1cmF0aW9uOiB0aW1pbmdzLmR1cmF0aW9uLCBkZWxheTogdGltaW5ncy5kZWxheSwgZWFzaW5nOiB0aW1pbmdzLmVhc2luZ307XG4gIH1cblxuICBvdmVycmlkZSBjb250YWluc0FuaW1hdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5rZXlmcmFtZXMubGVuZ3RoID4gMTtcbiAgfVxuXG4gIG92ZXJyaWRlIGJ1aWxkS2V5ZnJhbWVzKCk6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb24ge1xuICAgIGxldCBrZXlmcmFtZXMgPSB0aGlzLmtleWZyYW1lcztcbiAgICBsZXQge2RlbGF5LCBkdXJhdGlvbiwgZWFzaW5nfSA9IHRoaXMudGltaW5ncztcbiAgICBpZiAodGhpcy5fc3RyZXRjaFN0YXJ0aW5nS2V5ZnJhbWUgJiYgZGVsYXkpIHtcbiAgICAgIGNvbnN0IG5ld0tleWZyYW1lczogQXJyYXk8ybVTdHlsZURhdGFNYXA+ID0gW107XG4gICAgICBjb25zdCB0b3RhbFRpbWUgPSBkdXJhdGlvbiArIGRlbGF5O1xuICAgICAgY29uc3Qgc3RhcnRpbmdHYXAgPSBkZWxheSAvIHRvdGFsVGltZTtcblxuICAgICAgLy8gdGhlIG9yaWdpbmFsIHN0YXJ0aW5nIGtleWZyYW1lIG5vdyBzdGFydHMgb25jZSB0aGUgZGVsYXkgaXMgZG9uZVxuICAgICAgY29uc3QgbmV3Rmlyc3RLZXlmcmFtZSA9IG5ldyBNYXAoa2V5ZnJhbWVzWzBdKTtcbiAgICAgIG5ld0ZpcnN0S2V5ZnJhbWUuc2V0KCdvZmZzZXQnLCAwKTtcbiAgICAgIG5ld0tleWZyYW1lcy5wdXNoKG5ld0ZpcnN0S2V5ZnJhbWUpO1xuXG4gICAgICBjb25zdCBvbGRGaXJzdEtleWZyYW1lID0gbmV3IE1hcChrZXlmcmFtZXNbMF0pO1xuICAgICAgb2xkRmlyc3RLZXlmcmFtZS5zZXQoJ29mZnNldCcsIHJvdW5kT2Zmc2V0KHN0YXJ0aW5nR2FwKSk7XG4gICAgICBuZXdLZXlmcmFtZXMucHVzaChvbGRGaXJzdEtleWZyYW1lKTtcblxuICAgICAgLypcbiAgICAgICAgV2hlbiB0aGUga2V5ZnJhbWUgaXMgc3RyZXRjaGVkIHRoZW4gaXQgbWVhbnMgdGhhdCB0aGUgZGVsYXkgYmVmb3JlIHRoZSBhbmltYXRpb25cbiAgICAgICAgc3RhcnRzIGlzIGdvbmUuIEluc3RlYWQgdGhlIGZpcnN0IGtleWZyYW1lIGlzIHBsYWNlZCBhdCB0aGUgc3RhcnQgb2YgdGhlIGFuaW1hdGlvblxuICAgICAgICBhbmQgaXQgaXMgdGhlbiBjb3BpZWQgdG8gd2hlcmUgaXQgc3RhcnRzIHdoZW4gdGhlIG9yaWdpbmFsIGRlbGF5IGlzIG92ZXIuIFRoaXMgYmFzaWNhbGx5XG4gICAgICAgIG1lYW5zIG5vdGhpbmcgYW5pbWF0ZXMgZHVyaW5nIHRoYXQgZGVsYXksIGJ1dCB0aGUgc3R5bGVzIGFyZSBzdGlsbCByZW5kZXJlZC4gRm9yIHRoaXNcbiAgICAgICAgdG8gd29yayB0aGUgb3JpZ2luYWwgb2Zmc2V0IHZhbHVlcyB0aGF0IGV4aXN0IGluIHRoZSBvcmlnaW5hbCBrZXlmcmFtZXMgbXVzdCBiZSBcIndhcnBlZFwiXG4gICAgICAgIHNvIHRoYXQgdGhleSBjYW4gdGFrZSB0aGUgbmV3IGtleWZyYW1lICsgZGVsYXkgaW50byBhY2NvdW50LlxuXG4gICAgICAgIGRlbGF5PTEwMDAsIGR1cmF0aW9uPTEwMDAsIGtleWZyYW1lcyA9IDAgLjUgMVxuXG4gICAgICAgIHR1cm5zIGludG9cblxuICAgICAgICBkZWxheT0wLCBkdXJhdGlvbj0yMDAwLCBrZXlmcmFtZXMgPSAwIC4zMyAuNjYgMVxuICAgICAgICovXG5cbiAgICAgIC8vIG9mZnNldHMgYmV0d2VlbiAxIC4uLiBuIC0xIGFyZSBhbGwgd2FycGVkIGJ5IHRoZSBrZXlmcmFtZSBzdHJldGNoXG4gICAgICBjb25zdCBsaW1pdCA9IGtleWZyYW1lcy5sZW5ndGggLSAxO1xuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gbGltaXQ7IGkrKykge1xuICAgICAgICBsZXQga2YgPSBuZXcgTWFwKGtleWZyYW1lc1tpXSk7XG4gICAgICAgIGNvbnN0IG9sZE9mZnNldCA9IGtmLmdldCgnb2Zmc2V0JykgYXMgbnVtYmVyO1xuICAgICAgICBjb25zdCB0aW1lQXRLZXlmcmFtZSA9IGRlbGF5ICsgb2xkT2Zmc2V0ICogZHVyYXRpb247XG4gICAgICAgIGtmLnNldCgnb2Zmc2V0Jywgcm91bmRPZmZzZXQodGltZUF0S2V5ZnJhbWUgLyB0b3RhbFRpbWUpKTtcbiAgICAgICAgbmV3S2V5ZnJhbWVzLnB1c2goa2YpO1xuICAgICAgfVxuXG4gICAgICAvLyB0aGUgbmV3IHN0YXJ0aW5nIGtleWZyYW1lIHNob3VsZCBiZSBhZGRlZCBhdCB0aGUgc3RhcnRcbiAgICAgIGR1cmF0aW9uID0gdG90YWxUaW1lO1xuICAgICAgZGVsYXkgPSAwO1xuICAgICAgZWFzaW5nID0gJyc7XG5cbiAgICAgIGtleWZyYW1lcyA9IG5ld0tleWZyYW1lcztcbiAgICB9XG5cbiAgICByZXR1cm4gY3JlYXRlVGltZWxpbmVJbnN0cnVjdGlvbihcbiAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgIGtleWZyYW1lcyxcbiAgICAgIHRoaXMucHJlU3R5bGVQcm9wcyxcbiAgICAgIHRoaXMucG9zdFN0eWxlUHJvcHMsXG4gICAgICBkdXJhdGlvbixcbiAgICAgIGRlbGF5LFxuICAgICAgZWFzaW5nLFxuICAgICAgdHJ1ZSxcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJvdW5kT2Zmc2V0KG9mZnNldDogbnVtYmVyLCBkZWNpbWFsUG9pbnRzID0gMyk6IG51bWJlciB7XG4gIGNvbnN0IG11bHQgPSBNYXRoLnBvdygxMCwgZGVjaW1hbFBvaW50cyAtIDEpO1xuICByZXR1cm4gTWF0aC5yb3VuZChvZmZzZXQgKiBtdWx0KSAvIG11bHQ7XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5TdHlsZXMoaW5wdXQ6IEFycmF5PMm1U3R5bGVEYXRhTWFwIHwgc3RyaW5nPiwgYWxsU3R5bGVzOiDJtVN0eWxlRGF0YU1hcCkge1xuICBjb25zdCBzdHlsZXM6IMm1U3R5bGVEYXRhTWFwID0gbmV3IE1hcCgpO1xuICBsZXQgYWxsUHJvcGVydGllczogc3RyaW5nW10gfCBJdGVyYWJsZUl0ZXJhdG9yPHN0cmluZz47XG4gIGlucHV0LmZvckVhY2goKHRva2VuKSA9PiB7XG4gICAgaWYgKHRva2VuID09PSAnKicpIHtcbiAgICAgIGFsbFByb3BlcnRpZXMgPz89IGFsbFN0eWxlcy5rZXlzKCk7XG4gICAgICBmb3IgKGxldCBwcm9wIG9mIGFsbFByb3BlcnRpZXMpIHtcbiAgICAgICAgc3R5bGVzLnNldChwcm9wLCBBVVRPX1NUWUxFKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgW3Byb3AsIHZhbF0gb2YgdG9rZW4gYXMgybVTdHlsZURhdGFNYXApIHtcbiAgICAgICAgc3R5bGVzLnNldChwcm9wLCB2YWwpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIHJldHVybiBzdHlsZXM7XG59XG4iXX0=
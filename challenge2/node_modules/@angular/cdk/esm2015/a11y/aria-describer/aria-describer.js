/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { addAriaReferencedId, getAriaReferenceIds, removeAriaReferencedId } from './aria-reference';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
/** ID used for the body container where all messages are appended. */
export const MESSAGES_CONTAINER_ID = 'cdk-describedby-message-container';
/** ID prefix used for each created message element. */
export const CDK_DESCRIBEDBY_ID_PREFIX = 'cdk-describedby-message';
/** Attribute given to each host element that is described by a message element. */
export const CDK_DESCRIBEDBY_HOST_ATTRIBUTE = 'cdk-describedby-host';
/** Global incremental identifier for each registered message element. */
let nextId = 0;
/** Global map of all registered message elements that have been placed into the document. */
const messageRegistry = new Map();
/** Container for all registered messages. */
let messagesContainer = null;
/**
 * Utility that creates visually hidden elements with a message content. Useful for elements that
 * want to use aria-describedby to further describe themselves without adding additional visual
 * content.
 */
export class AriaDescriber {
    constructor(_document) {
        this._document = _document;
    }
    describe(hostElement, message, role) {
        if (!this._canBeDescribed(hostElement, message)) {
            return;
        }
        const key = getKey(message, role);
        if (typeof message !== 'string') {
            // We need to ensure that the element has an ID.
            setMessageId(message);
            messageRegistry.set(key, { messageElement: message, referenceCount: 0 });
        }
        else if (!messageRegistry.has(key)) {
            this._createMessageElement(message, role);
        }
        if (!this._isElementDescribedByMessage(hostElement, key)) {
            this._addMessageReference(hostElement, key);
        }
    }
    removeDescription(hostElement, message, role) {
        if (!message || !this._isElementNode(hostElement)) {
            return;
        }
        const key = getKey(message, role);
        if (this._isElementDescribedByMessage(hostElement, key)) {
            this._removeMessageReference(hostElement, key);
        }
        // If the message is a string, it means that it's one that we created for the
        // consumer so we can remove it safely, otherwise we should leave it in place.
        if (typeof message === 'string') {
            const registeredMessage = messageRegistry.get(key);
            if (registeredMessage && registeredMessage.referenceCount === 0) {
                this._deleteMessageElement(key);
            }
        }
        if (messagesContainer && messagesContainer.childNodes.length === 0) {
            this._deleteMessagesContainer();
        }
    }
    /** Unregisters all created message elements and removes the message container. */
    ngOnDestroy() {
        const describedElements = this._document.querySelectorAll(`[${CDK_DESCRIBEDBY_HOST_ATTRIBUTE}]`);
        for (let i = 0; i < describedElements.length; i++) {
            this._removeCdkDescribedByReferenceIds(describedElements[i]);
            describedElements[i].removeAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE);
        }
        if (messagesContainer) {
            this._deleteMessagesContainer();
        }
        messageRegistry.clear();
    }
    /**
     * Creates a new element in the visually hidden message container element with the message
     * as its content and adds it to the message registry.
     */
    _createMessageElement(message, role) {
        const messageElement = this._document.createElement('div');
        setMessageId(messageElement);
        messageElement.textContent = message;
        if (role) {
            messageElement.setAttribute('role', role);
        }
        this._createMessagesContainer();
        messagesContainer.appendChild(messageElement);
        messageRegistry.set(getKey(message, role), { messageElement, referenceCount: 0 });
    }
    /** Deletes the message element from the global messages container. */
    _deleteMessageElement(key) {
        const registeredMessage = messageRegistry.get(key);
        const messageElement = registeredMessage && registeredMessage.messageElement;
        if (messagesContainer && messageElement) {
            messagesContainer.removeChild(messageElement);
        }
        messageRegistry.delete(key);
    }
    /** Creates the global container for all aria-describedby messages. */
    _createMessagesContainer() {
        if (!messagesContainer) {
            const preExistingContainer = this._document.getElementById(MESSAGES_CONTAINER_ID);
            // When going from the server to the client, we may end up in a situation where there's
            // already a container on the page, but we don't have a reference to it. Clear the
            // old container so we don't get duplicates. Doing this, instead of emptying the previous
            // container, should be slightly faster.
            if (preExistingContainer && preExistingContainer.parentNode) {
                preExistingContainer.parentNode.removeChild(preExistingContainer);
            }
            messagesContainer = this._document.createElement('div');
            messagesContainer.id = MESSAGES_CONTAINER_ID;
            // We add `visibility: hidden` in order to prevent text in this container from
            // being searchable by the browser's Ctrl + F functionality.
            // Screen-readers will still read the description for elements with aria-describedby even
            // when the description element is not visible.
            messagesContainer.style.visibility = 'hidden';
            // Even though we use `visibility: hidden`, we still apply `cdk-visually-hidden` so that
            // the description element doesn't impact page layout.
            messagesContainer.classList.add('cdk-visually-hidden');
            this._document.body.appendChild(messagesContainer);
        }
    }
    /** Deletes the global messages container. */
    _deleteMessagesContainer() {
        if (messagesContainer && messagesContainer.parentNode) {
            messagesContainer.parentNode.removeChild(messagesContainer);
            messagesContainer = null;
        }
    }
    /** Removes all cdk-describedby messages that are hosted through the element. */
    _removeCdkDescribedByReferenceIds(element) {
        // Remove all aria-describedby reference IDs that are prefixed by CDK_DESCRIBEDBY_ID_PREFIX
        const originalReferenceIds = getAriaReferenceIds(element, 'aria-describedby')
            .filter(id => id.indexOf(CDK_DESCRIBEDBY_ID_PREFIX) != 0);
        element.setAttribute('aria-describedby', originalReferenceIds.join(' '));
    }
    /**
     * Adds a message reference to the element using aria-describedby and increments the registered
     * message's reference count.
     */
    _addMessageReference(element, key) {
        const registeredMessage = messageRegistry.get(key);
        // Add the aria-describedby reference and set the
        // describedby_host attribute to mark the element.
        addAriaReferencedId(element, 'aria-describedby', registeredMessage.messageElement.id);
        element.setAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE, '');
        registeredMessage.referenceCount++;
    }
    /**
     * Removes a message reference from the element using aria-describedby
     * and decrements the registered message's reference count.
     */
    _removeMessageReference(element, key) {
        const registeredMessage = messageRegistry.get(key);
        registeredMessage.referenceCount--;
        removeAriaReferencedId(element, 'aria-describedby', registeredMessage.messageElement.id);
        element.removeAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE);
    }
    /** Returns true if the element has been described by the provided message ID. */
    _isElementDescribedByMessage(element, key) {
        const referenceIds = getAriaReferenceIds(element, 'aria-describedby');
        const registeredMessage = messageRegistry.get(key);
        const messageId = registeredMessage && registeredMessage.messageElement.id;
        return !!messageId && referenceIds.indexOf(messageId) != -1;
    }
    /** Determines whether a message can be described on a particular element. */
    _canBeDescribed(element, message) {
        if (!this._isElementNode(element)) {
            return false;
        }
        if (message && typeof message === 'object') {
            // We'd have to make some assumptions about the description element's text, if the consumer
            // passed in an element. Assume that if an element is passed in, the consumer has verified
            // that it can be used as a description.
            return true;
        }
        const trimmedMessage = message == null ? '' : `${message}`.trim();
        const ariaLabel = element.getAttribute('aria-label');
        // We shouldn't set descriptions if they're exactly the same as the `aria-label` of the
        // element, because screen readers will end up reading out the same text twice in a row.
        return trimmedMessage ? (!ariaLabel || ariaLabel.trim() !== trimmedMessage) : false;
    }
    /** Checks whether a node is an Element node. */
    _isElementNode(element) {
        return element.nodeType === this._document.ELEMENT_NODE;
    }
}
AriaDescriber.ɵprov = i0.ɵɵdefineInjectable({ factory: function AriaDescriber_Factory() { return new AriaDescriber(i0.ɵɵinject(i1.DOCUMENT)); }, token: AriaDescriber, providedIn: "root" });
AriaDescriber.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
AriaDescriber.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
/** Gets a key that can be used to look messages up in the registry. */
function getKey(message, role) {
    return typeof message === 'string' ? `${role || ''}/${message}` : message;
}
/** Assigns a unique ID to an element, if it doesn't have one already. */
function setMessageId(element) {
    if (!element.id) {
        element.id = `${CDK_DESCRIBEDBY_ID_PREFIX}-${nextId++}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJpYS1kZXNjcmliZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2ExMXkvYXJpYS1kZXNjcmliZXIvYXJpYS1kZXNjcmliZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQzVELE9BQU8sRUFBQyxtQkFBbUIsRUFBRSxtQkFBbUIsRUFBRSxzQkFBc0IsRUFBQyxNQUFNLGtCQUFrQixDQUFDOzs7QUFlbEcsc0VBQXNFO0FBQ3RFLE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLG1DQUFtQyxDQUFDO0FBRXpFLHVEQUF1RDtBQUN2RCxNQUFNLENBQUMsTUFBTSx5QkFBeUIsR0FBRyx5QkFBeUIsQ0FBQztBQUVuRSxtRkFBbUY7QUFDbkYsTUFBTSxDQUFDLE1BQU0sOEJBQThCLEdBQUcsc0JBQXNCLENBQUM7QUFFckUseUVBQXlFO0FBQ3pFLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUVmLDZGQUE2RjtBQUM3RixNQUFNLGVBQWUsR0FBRyxJQUFJLEdBQUcsRUFBcUMsQ0FBQztBQUVyRSw2Q0FBNkM7QUFDN0MsSUFBSSxpQkFBaUIsR0FBdUIsSUFBSSxDQUFDO0FBRWpEOzs7O0dBSUc7QUFFSCxNQUFNLE9BQU8sYUFBYTtJQUd4QixZQUNvQixTQUFjO1FBQ2hDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQzdCLENBQUM7SUFjRCxRQUFRLENBQUMsV0FBb0IsRUFBRSxPQUEyQixFQUFFLElBQWE7UUFDdkUsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxFQUFFO1lBQy9DLE9BQU87U0FDUjtRQUVELE1BQU0sR0FBRyxHQUFHLE1BQU0s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Q0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbEUsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUVyRCx1RkFBdUY7UUFDdkYsd0ZBQXdGO1FBQ3hGLE9BQU8sY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ3RGLENBQUM7SUFFRCxnREFBZ0Q7SUFDeEMsY0FBYyxDQUFDLE9BQWE7UUFDbEMsT0FBTyxPQUFPLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDO0lBQzFELENBQUM7Ozs7WUE1TkYsVUFBVSxTQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7OzRDQUszQixNQUFNLFNBQUMsUUFBUTs7QUEwTnBCLHVFQUF1RTtBQUN2RSxTQUFTLE1BQU0sQ0FBQyxPQUF1QixFQUFFLElBQWE7SUFDcEQsT0FBTyxPQUFPLE9BQU8sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsSUFBSSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQzVFLENBQUM7QUFFRCx5RUFBeUU7QUFDekUsU0FBUyxZQUFZLENBQUMsT0FBb0I7SUFDeEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUU7UUFDZixPQUFPLENBQUMsRUFBRSxHQUFHLEdBQUcseUJBQXlCLElBQUksTUFBTSxFQUFFLEVBQUUsQ0FBQztLQUN6RDtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHthZGRBcmlhUmVmZXJlbmNlZElkLCBnZXRBcmlhUmVmZXJlbmNlSWRzLCByZW1vdmVBcmlhUmVmZXJlbmNlZElkfSBmcm9tICcuL2FyaWEtcmVmZXJlbmNlJztcblxuXG4vKipcbiAqIEludGVyZmFjZSB1c2VkIHRvIHJlZ2lzdGVyIG1lc3NhZ2UgZWxlbWVudHMgYW5kIGtlZXAgYSBjb3VudCBvZiBob3cgbWFueSByZWdpc3RyYXRpb25zIGhhdmVcbiAqIHRoZSBzYW1lIG1lc3NhZ2UgYW5kIHRoZSByZWZlcmVuY2UgdG8gdGhlIG1lc3NhZ2UgZWxlbWVudCB1c2VkIGZvciB0aGUgYGFyaWEtZGVzY3JpYmVkYnlgLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlZ2lzdGVyZWRNZXNzYWdlIHtcbiAgLyoqIFRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIG1lc3NhZ2UuICovXG4gIG1lc3NhZ2VFbGVtZW50OiBFbGVtZW50O1xuXG4gIC8qKiBUaGUgbnVtYmVyIG9mIGVsZW1lbnRzIHRoYXQgcmVmZXJlbmNlIHRoaXMgbWVzc2FnZSBlbGVtZW50IHZpYSBgYXJpYS1kZXNjcmliZWRieWAuICovXG4gIHJlZmVyZW5jZUNvdW50OiBudW1iZXI7XG59XG5cbi8qKiBJRCB1c2VkIGZvciB0aGUgYm9keSBjb250YWluZXIgd2hlcmUgYWxsIG1lc3NhZ2VzIGFyZSBhcHBlbmRlZC4gKi9cbmV4cG9ydCBjb25zdCBNRVNTQUdFU19DT05UQUlORVJfSUQgPSAnY2RrLWRlc2NyaWJlZGJ5LW1lc3NhZ2UtY29udGFpbmVyJztcblxuLyoqIElEIHByZWZpeCB1c2VkIGZvciBlYWNoIGNyZWF0ZWQgbWVzc2FnZSBlbGVtZW50LiAqL1xuZXhwb3J0IGNvbnN0IENES19ERVNDUklCRURCWV9JRF9QUkVGSVggPSAnY2RrLWRlc2NyaWJlZGJ5LW1lc3NhZ2UnO1xuXG4vKiogQXR0cmlidXRlIGdpdmVuIHRvIGVhY2ggaG9zdCBlbGVtZW50IHRoYXQgaXMgZGVzY3JpYmVkIGJ5IGEgbWVzc2FnZSBlbGVtZW50LiAqL1xuZXhwb3J0IGNvbnN0IENES19ERVNDUklCRURCWV9IT1NUX0FUVFJJQlVURSA9ICdjZGstZGVzY3JpYmVkYnktaG9zdCc7XG5cbi8qKiBHbG9iYWwgaW5jcmVtZW50YWwgaWRlbnRpZmllciBmb3IgZWFjaCByZWdpc3RlcmVkIG1lc3NhZ2UgZWxlbWVudC4gKi9cbmxldCBuZXh0SWQgPSAwO1xuXG4vKiogR2xvYmFsIG1hcCBvZiBhbGwgcmVnaXN0ZXJlZCBtZXNzYWdlIGVsZW1lbnRzIHRoYXQgaGF2ZSBiZWVuIHBsYWNlZCBpbnRvIHRoZSBkb2N1bWVudC4gKi9cbmNvbnN0IG1lc3NhZ2VSZWdpc3RyeSA9IG5ldyBNYXA8c3RyaW5nfEVsZW1lbnQsIFJlZ2lzdGVyZWRNZXNzYWdlPigpO1xuXG4vKiogQ29udGFpbmVyIGZvciBhbGwgcmVnaXN0ZXJlZCBtZXNzYWdlcy4gKi9cbmxldCBtZXNzYWdlc0NvbnRhaW5lcjogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuLyoqXG4gKiBVdGlsaXR5IHRoYXQgY3JlYXRlcyB2aXN1YWxseSBoaWRkZW4gZWxlbWVudHMgd2l0aCBhIG1lc3NhZ2UgY29udGVudC4gVXNlZnVsIGZvciBlbGVtZW50cyB0aGF0XG4gKiB3YW50IHRvIHVzZSBhcmlhLWRlc2NyaWJlZGJ5IHRvIGZ1cnRoZXIgZGVzY3JpYmUgdGhlbXNlbHZlcyB3aXRob3V0IGFkZGluZyBhZGRpdGlvbmFsIHZpc3VhbFxuICogY29udGVudC5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgQXJpYURlc2NyaWJlciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBfZG9jdW1lbnQ6IGFueSkge1xuICAgIHRoaXMuX2RvY3VtZW50ID0gX2RvY3VtZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdG8gdGhlIGhvc3QgZWxlbWVudCBhbiBhcmlhLWRlc2NyaWJlZGJ5IHJlZmVyZW5jZSB0byBhIGhpZGRlbiBlbGVtZW50IHRoYXQgY29udGFpbnNcbiAgICogdGhlIG1lc3NhZ2UuIElmIHRoZSBzYW1lIG1lc3NhZ2UgaGFzIGFscmVhZHkgYmVlbiByZWdpc3RlcmVkLCB0aGVuIGl0IHdpbGwgcmV1c2UgdGhlIGNyZWF0ZWRcbiAgICogbWVzc2FnZSBlbGVtZW50LlxuICAgKi9cbiAgZGVzY3JpYmUoaG9zdEVsZW1lbnQ6IEVsZW1lbnQsIG1lc3NhZ2U6IHN0cmluZywgcm9sZT86IHN0cmluZyk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEFkZHMgdG8gdGhlIGhvc3QgZWxlbWVudCBhbiBhcmlhLWRlc2NyaWJlZGJ5IHJlZmVyZW5jZSB0byBhbiBhbHJlYWR5LWV4aXN0aW5nIG1lc3NhZ2UgZWxlbWVudC5cbiAgICovXG4gIGRlc2NyaWJlKGhvc3RFbGVtZW50OiBFbGVtZW50LCBtZXNzYWdlOiBIVE1MRWxlbWVudCk6IHZvaWQ7XG5cbiAgZGVzY3JpYmUoaG9zdEVsZW1lbnQ6IEVsZW1lbnQsIG1lc3NhZ2U6IHN0cmluZ3xIVE1MRWxlbWVudCwgcm9sZT86IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fY2FuQmVEZXNjcmliZWQoaG9zdEVsZW1lbnQsIG1lc3NhZ2UpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qga2V5ID0gZ2V0S2V5KG1lc3NhZ2UsIHJvbGUpO1xuXG4gICAgaWYgKHR5cGVvZiBtZXNzYWdlICE9PSAnc3RyaW5nJykge1xuICAgICAgLy8gV2UgbmVlZCB0byBlbnN1cmUgdGhhdCB0aGUgZWxlbWVudCBoYXMgYW4gSUQuXG4gICAgICBzZXRNZXNzYWdlSWQobWVzc2FnZSk7XG4gICAgICBtZXNzYWdlUmVnaXN0cnkuc2V0KGtleSwge21lc3NhZ2VFbGVtZW50OiBtZXNzYWdlLCByZWZlcmVuY2VDb3VudDogMH0pO1xuICAgIH0gZWxzZSBpZiAoIW1lc3NhZ2VSZWdpc3RyeS5oYXMoa2V5KSkge1xuICAgICAgdGhpcy5fY3JlYXRlTWVzc2FnZUVsZW1lbnQobWVzc2FnZSwgcm9sZSk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9pc0VsZW1lbnREZXNjcmliZWRCeU1lc3NhZ2UoaG9zdEVsZW1lbnQsIGtleSkpIHtcbiAgICAgIHRoaXMuX2FkZE1lc3NhZ2VSZWZlcmVuY2UoaG9zdEVsZW1lbnQsIGtleSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlbW92ZXMgdGhlIGhvc3QgZWxlbWVudCdzIGFyaWEtZGVzY3JpYmVkYnkgcmVmZXJlbmNlIHRvIHRoZSBtZXNzYWdlLiAqL1xuICByZW1vdmVEZXNjcmlwdGlvbihob3N0RWxlbWVudDogRWxlbWVudCwgbWVzc2FnZTogc3RyaW5nLCByb2xlPzogc3RyaW5nKTogdm9pZDtcblxuICAvKiogUmVtb3ZlcyB0aGUgaG9zdCBlbGVtZW50J3MgYXJpYS1kZXNjcmliZWRieSByZWZlcmVuY2UgdG8gdGhlIG1lc3NhZ2UgZWxlbWVudC4gKi9cbiAgcmVtb3ZlRGVzY3JpcHRpb24oaG9zdEVsZW1lbnQ6IEVsZW1lbnQsIG1lc3NhZ2U6IEhUTUxFbGVtZW50KTogdm9pZDtcblxuICByZW1vdmVEZXNjcmlwdGlvbihob3N0RWxlbWVudDogRWxlbWVudCwgbWVzc2FnZTogc3RyaW5nfEhUTUxFbGVtZW50LCByb2xlPzogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCFtZXNzYWdlIHx8ICF0aGlzLl9pc0VsZW1lbnROb2RlKGhvc3RFbGVtZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGtleSA9IGdldEtleShtZXNzYWdlLCByb2xlKTtcblxuICAgIGlmICh0aGlzLl9pc0VsZW1lbnREZXNjcmliZWRCeU1lc3NhZ2UoaG9zdEVsZW1lbnQsIGtleSkpIHtcbiAgICAgIHRoaXMuX3JlbW92ZU1lc3NhZ2VSZWZlcmVuY2UoaG9zdEVsZW1lbnQsIGtleSk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIG1lc3NhZ2UgaXMgYSBzdHJpbmcsIGl0IG1lYW5zIHRoYXQgaXQncyBvbmUgdGhhdCB3ZSBjcmVhdGVkIGZvciB0aGVcbiAgICAvLyBjb25zdW1lciBzbyB3ZSBjYW4gcmVtb3ZlIGl0IHNhZmVseSwgb3RoZXJ3aXNlIHdlIHNob3VsZCBsZWF2ZSBpdCBpbiBwbGFjZS5cbiAgICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCByZWdpc3RlcmVkTWVzc2FnZSA9IG1lc3NhZ2VSZWdpc3RyeS5nZXQoa2V5KTtcbiAgICAgIGlmIChyZWdpc3RlcmVkTWVzc2FnZSAmJiByZWdpc3RlcmVkTWVzc2FnZS5yZWZlcmVuY2VDb3VudCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9kZWxldGVNZXNzYWdlRWxlbWVudChrZXkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtZXNzYWdlc0NvbnRhaW5lciAmJiBtZXNzYWdlc0NvbnRhaW5lci5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5fZGVsZXRlTWVzc2FnZXNDb250YWluZXIoKTtcbiAgICB9XG4gIH1cblxuICAvKiogVW5yZWdpc3RlcnMgYWxsIGNyZWF0ZWQgbWVzc2FnZSBlbGVtZW50cyBhbmQgcmVtb3ZlcyB0aGUgbWVzc2FnZSBjb250YWluZXIuICovXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGNvbnN0IGRlc2NyaWJlZEVsZW1lbnRzID1cbiAgICAgICAgdGhpcy5fZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgWyR7Q0RLX0RFU0NSSUJFREJZX0hPU1RfQVRUUklCVVRFfV1gKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGVzY3JpYmVkRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuX3JlbW92ZUNka0Rlc2NyaWJlZEJ5UmVmZXJlbmNlSWRzKGRlc2NyaWJlZEVsZW1lbnRzW2ldKTtcbiAgICAgIGRlc2NyaWJlZEVsZW1lbnRzW2ldLnJlbW92ZUF0dHJpYnV0ZShDREtfREVTQ1JJQkVEQllfSE9TVF9BVFRSSUJVVEUpO1xuICAgIH1cblxuICAgIGlmIChtZXNzYWdlc0NvbnRhaW5lcikge1xuICAgICAgdGhpcy5fZGVsZXRlTWVzc2FnZXNDb250YWluZXIoKTtcbiAgICB9XG5cbiAgICBtZXNzYWdlUmVnaXN0cnkuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGVsZW1lbnQgaW4gdGhlIHZpc3VhbGx5IGhpZGRlbiBtZXNzYWdlIGNvbnRhaW5lciBlbGVtZW50IHdpdGggdGhlIG1lc3NhZ2VcbiAgICogYXMgaXRzIGNvbnRlbnQgYW5kIGFkZHMgaXQgdG8gdGhlIG1lc3NhZ2UgcmVnaXN0cnkuXG4gICAqL1xuICBwcml2YXRlIF9jcmVhdGVNZXNzYWdlRWxlbWVudChtZXNzYWdlOiBzdHJpbmcsIHJvbGU/OiBzdHJpbmcpIHtcbiAgICBjb25zdCBtZXNzYWdlRWxlbWVudCA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHNldE1lc3NhZ2VJZChtZXNzYWdlRWxlbWVudCk7XG4gICAgbWVzc2FnZUVsZW1lbnQudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xuXG4gICAgaWYgKHJvbGUpIHtcbiAgICAgIG1lc3NhZ2VFbGVtZW50LnNldEF0dHJpYnV0ZSgncm9sZScsIHJvbGUpO1xuICAgIH1cblxuICAgIHRoaXMuX2NyZWF0ZU1lc3NhZ2VzQ29udGFpbmVyKCk7XG4gICAgbWVzc2FnZXNDb250YWluZXIhLmFwcGVuZENoaWxkKG1lc3NhZ2VFbGVtZW50KTtcbiAgICBtZXNzYWdlUmVnaXN0cnkuc2V0KGdldEtleShtZXNzYWdlLCByb2xlKSwge21lc3NhZ2VFbGVtZW50LCByZWZlcmVuY2VDb3VudDogMH0pO1xuICB9XG5cbiAgLyoqIERlbGV0ZXMgdGhlIG1lc3NhZ2UgZWxlbWVudCBmcm9tIHRoZSBnbG9iYWwgbWVzc2FnZXMgY29udGFpbmVyLiAqL1xuICBwcml2YXRlIF9kZWxldGVNZXNzYWdlRWxlbWVudChrZXk6IHN0cmluZ3xFbGVtZW50KSB7XG4gICAgY29uc3QgcmVnaXN0ZXJlZE1lc3NhZ2UgPSBtZXNzYWdlUmVnaXN0cnkuZ2V0KGtleSk7XG4gICAgY29uc3QgbWVzc2FnZUVsZW1lbnQgPSByZWdpc3RlcmVkTWVzc2FnZSAmJiByZWdpc3RlcmVkTWVzc2FnZS5tZXNzYWdlRWxlbWVudDtcbiAgICBpZiAobWVzc2FnZXNDb250YWluZXIgJiYgbWVzc2FnZUVsZW1lbnQpIHtcbiAgICAgIG1lc3NhZ2VzQ29udGFpbmVyLnJlbW92ZUNoaWxkKG1lc3NhZ2VFbGVtZW50KTtcbiAgICB9XG4gICAgbWVzc2FnZVJlZ2lzdHJ5LmRlbGV0ZShrZXkpO1xuICB9XG5cbiAgLyoqIENyZWF0ZXMgdGhlIGdsb2JhbCBjb250YWluZXIgZm9yIGFsbCBhcmlhLWRlc2NyaWJlZGJ5IG1lc3NhZ2VzLiAqL1xuICBwcml2YXRlIF9jcmVhdGVNZXNzYWdlc0NvbnRhaW5lcigpIHtcbiAgICBpZiAoIW1lc3NhZ2VzQ29udGFpbmVyKSB7XG4gICAgICBjb25zdCBwcmVFeGlzdGluZ0NvbnRhaW5lciA9IHRoaXMuX2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKE1FU1NBR0VTX0NPTlRBSU5FUl9JRCk7XG5cbiAgICAgIC8vIFdoZW4gZ29pbmcgZnJvbSB0aGUgc2VydmVyIHRvIHRoZSBjbGllbnQsIHdlIG1heSBlbmQgdXAgaW4gYSBzaXR1YXRpb24gd2hlcmUgdGhlcmUnc1xuICAgICAgLy8gYWxyZWFkeSBhIGNvbnRhaW5lciBvbiB0aGUgcGFnZSwgYnV0IHdlIGRvbid0IGhhdmUgYSByZWZlcmVuY2UgdG8gaXQuIENsZWFyIHRoZVxuICAgICAgLy8gb2xkIGNvbnRhaW5lciBzbyB3ZSBkb24ndCBnZXQgZHVwbGljYXRlcy4gRG9pbmcgdGhpcywgaW5zdGVhZCBvZiBlbXB0eWluZyB0aGUgcHJldmlvdXNcbiAgICAgIC8vIGNvbnRhaW5lciwgc2hvdWxkIGJlIHNsaWdodGx5IGZhc3Rlci5cbiAgICAgIGlmIChwcmVFeGlzdGluZ0NvbnRhaW5lciAmJiBwcmVFeGlzdGluZ0NvbnRhaW5lci5wYXJlbnROb2RlKSB7XG4gICAgICAgIHByZUV4aXN0aW5nQ29udGFpbmVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocHJlRXhpc3RpbmdDb250YWluZXIpO1xuICAgICAgfVxuXG4gICAgICBtZXNzYWdlc0NvbnRhaW5lciA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgbWVzc2FnZXNDb250YWluZXIuaWQgPSBNRVNTQUdFU19DT05UQUlORVJfSUQ7XG4gICAgICAvLyBXZSBhZGQgYHZpc2liaWxpdHk6IGhpZGRlbmAgaW4gb3JkZXIgdG8gcHJldmVudCB0ZXh0IGluIHRoaXMgY29udGFpbmVyIGZyb21cbiAgICAgIC8vIGJlaW5nIHNlYXJjaGFibGUgYnkgdGhlIGJyb3dzZXIncyBDdHJsICsgRiBmdW5jdGlvbmFsaXR5LlxuICAgICAgLy8gU2NyZWVuLXJlYWRlcnMgd2lsbCBzdGlsbCByZWFkIHRoZSBkZXNjcmlwdGlvbiBmb3IgZWxlbWVudHMgd2l0aCBhcmlhLWRlc2NyaWJlZGJ5IGV2ZW5cbiAgICAgIC8vIHdoZW4gdGhlIGRlc2NyaXB0aW9uIGVsZW1lbnQgaXMgbm90IHZpc2libGUuXG4gICAgICBtZXNzYWdlc0NvbnRhaW5lci5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgICAvLyBFdmVuIHRob3VnaCB3ZSB1c2UgYHZpc2liaWxpdHk6IGhpZGRlbmAsIHdlIHN0aWxsIGFwcGx5IGBjZGstdmlzdWFsbHktaGlkZGVuYCBzbyB0aGF0XG4gICAgICAvLyB0aGUgZGVzY3JpcHRpb24gZWxlbWVudCBkb2Vzbid0IGltcGFjdCBwYWdlIGxheW91dC5cbiAgICAgIG1lc3NhZ2VzQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2Nkay12aXN1YWxseS1oaWRkZW4nKTtcblxuICAgICAgdGhpcy5fZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtZXNzYWdlc0NvbnRhaW5lcik7XG4gICAgfVxuICB9XG5cbiAgLyoqIERlbGV0ZXMgdGhlIGdsb2JhbCBtZXNzYWdlcyBjb250YWluZXIuICovXG4gIHByaXZhdGUgX2RlbGV0ZU1lc3NhZ2VzQ29udGFpbmVyKCkge1xuICAgIGlmIChtZXNzYWdlc0NvbnRhaW5lciAmJiBtZXNzYWdlc0NvbnRhaW5lci5wYXJlbnROb2RlKSB7XG4gICAgICBtZXNzYWdlc0NvbnRhaW5lci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG1lc3NhZ2VzQ29udGFpbmVyKTtcbiAgICAgIG1lc3NhZ2VzQ29udGFpbmVyID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKiogUmVtb3ZlcyBhbGwgY2RrLWRlc2NyaWJlZGJ5IG1lc3NhZ2VzIHRoYXQgYXJlIGhvc3RlZCB0aHJvdWdoIHRoZSBlbGVtZW50LiAqL1xuICBwcml2YXRlIF9yZW1vdmVDZGtEZXNjcmliZWRCeVJlZmVyZW5jZUlkcyhlbGVtZW50OiBFbGVtZW50KSB7XG4gICAgLy8gUmVtb3ZlIGFsbCBhcmlhLWRlc2NyaWJlZGJ5IHJlZmVyZW5jZSBJRHMgdGhhdCBhcmUgcHJlZml4ZWQgYnkgQ0RLX0RFU0NSSUJFREJZX0lEX1BSRUZJWFxuICAgIGNvbnN0IG9yaWdpbmFsUmVmZXJlbmNlSWRzID0gZ2V0QXJpYVJlZmVyZW5jZUlkcyhlbGVtZW50LCAnYXJpYS1kZXNjcmliZWRieScpXG4gICAgICAgIC5maWx0ZXIoaWQgPT4gaWQuaW5kZXhPZihDREtfREVTQ1JJQkVEQllfSURfUFJFRklYKSAhPSAwKTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1kZXNjcmliZWRieScsIG9yaWdpbmFsUmVmZXJlbmNlSWRzLmpvaW4oJyAnKSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIG1lc3NhZ2UgcmVmZXJlbmNlIHRvIHRoZSBlbGVtZW50IHVzaW5nIGFyaWEtZGVzY3JpYmVkYnkgYW5kIGluY3JlbWVudHMgdGhlIHJlZ2lzdGVyZWRcbiAgICogbWVzc2FnZSdzIHJlZmVyZW5jZSBjb3VudC5cbiAgICovXG4gIHByaXZhdGUgX2FkZE1lc3NhZ2VSZWZlcmVuY2UoZWxlbWVudDogRWxlbWVudCwga2V5OiBzdHJpbmd8RWxlbWVudCkge1xuICAgIGNvbnN0IHJlZ2lzdGVyZWRNZXNzYWdlID0gbWVzc2FnZVJlZ2lzdHJ5LmdldChrZXkpITtcblxuICAgIC8vIEFkZCB0aGUgYXJpYS1kZXNjcmliZWRieSByZWZlcmVuY2UgYW5kIHNldCB0aGVcbiAgICAvLyBkZXNjcmliZWRieV9ob3N0IGF0dHJpYnV0ZSB0byBtYXJrIHRoZSBlbGVtZW50LlxuICAgIGFkZEFyaWFSZWZlcmVuY2VkSWQoZWxlbWVudCwgJ2FyaWEtZGVzY3JpYmVkYnknLCByZWdpc3RlcmVkTWVzc2FnZS5tZXNzYWdlRWxlbWVudC5pZCk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoQ0RLX0RFU0NSSUJFREJZX0hPU1RfQVRUUklCVVRFLCAnJyk7XG4gICAgcmVnaXN0ZXJlZE1lc3NhZ2UucmVmZXJlbmNlQ291bnQrKztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgbWVzc2FnZSByZWZlcmVuY2UgZnJvbSB0aGUgZWxlbWVudCB1c2luZyBhcmlhLWRlc2NyaWJlZGJ5XG4gICAqIGFuZCBkZWNyZW1lbnRzIHRoZSByZWdpc3RlcmVkIG1lc3NhZ2UncyByZWZlcmVuY2UgY291bnQuXG4gICAqL1xuICBwcml2YXRlIF9yZW1vdmVNZXNzYWdlUmVmZXJlbmNlKGVsZW1lbnQ6IEVsZW1lbnQsIGtleTogc3RyaW5nfEVsZW1lbnQpIHtcbiAgICBjb25zdCByZWdpc3RlcmVkTWVzc2FnZSA9IG1lc3NhZ2VSZWdpc3RyeS5nZXQoa2V5KSE7XG4gICAgcmVnaXN0ZXJlZE1lc3NhZ2UucmVmZXJlbmNlQ291bnQtLTtcblxuICAgIHJlbW92ZUFyaWFSZWZlcmVuY2VkSWQoZWxlbWVudCwgJ2FyaWEtZGVzY3JpYmVkYnknLCByZWdpc3RlcmVkTWVzc2FnZS5tZXNzYWdlRWxlbWVudC5pZCk7XG4gICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoQ0RLX0RFU0NSSUJFREJZX0hPU1RfQVRUUklCVVRFKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRydWUgaWYgdGhlIGVsZW1lbnQgaGFzIGJlZW4gZGVzY3JpYmVkIGJ5IHRoZSBwcm92aWRlZCBtZXNzYWdlIElELiAqL1xuICBwcml2YXRlIF9pc0VsZW1lbnREZXNjcmliZWRCeU1lc3NhZ2UoZWxlbWVudDogRWxlbWVudCwga2V5OiBzdHJpbmd8RWxlbWVudCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHJlZmVyZW5jZUlkcyA9IGdldEFyaWFSZWZlcmVuY2VJZHMoZWxlbWVudCwgJ2FyaWEtZGVzY3JpYmVkYnknKTtcbiAgICBjb25zdCByZWdpc3RlcmVkTWVzc2FnZSA9IG1lc3NhZ2VSZWdpc3RyeS5nZXQoa2V5KTtcbiAgICBjb25zdCBtZXNzYWdlSWQgPSByZWdpc3RlcmVkTWVzc2FnZSAmJiByZWdpc3RlcmVkTWVzc2FnZS5tZXNzYWdlRWxlbWVudC5pZDtcblxuICAgIHJldHVybiAhIW1lc3NhZ2VJZCAmJiByZWZlcmVuY2VJZHMuaW5kZXhPZihtZXNzYWdlSWQpICE9IC0xO1xuICB9XG5cbiAgLyoqIERldGVybWluZXMgd2hldGhlciBhIG1lc3NhZ2UgY2FuIGJlIGRlc2NyaWJlZCBvbiBhIHBhcnRpY3VsYXIgZWxlbWVudC4gKi9cbiAgcHJpdmF0ZSBfY2FuQmVEZXNjcmliZWQoZWxlbWVudDogRWxlbWVudCwgbWVzc2FnZTogc3RyaW5nfEhUTUxFbGVtZW50fHZvaWQpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuX2lzRWxlbWVudE5vZGUoZWxlbWVudCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZSAmJiB0eXBlb2YgbWVzc2FnZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIC8vIFdlJ2QgaGF2ZSB0byBtYWtlIHNvbWUgYXNzdW1wdGlvbnMgYWJvdXQgdGhlIGRlc2NyaXB0aW9uIGVsZW1lbnQncyB0ZXh0LCBpZiB0aGUgY29uc3VtZXJcbiAgICAgIC8vIHBhc3NlZCBpbiBhbiBlbGVtZW50LiBBc3N1bWUgdGhhdCBpZiBhbiBlbGVtZW50IGlzIHBhc3NlZCBpbiwgdGhlIGNvbnN1bWVyIGhhcyB2ZXJpZmllZFxuICAgICAgLy8gdGhhdCBpdCBjYW4gYmUgdXNlZCBhcyBhIGRlc2NyaXB0aW9uLlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgdHJpbW1lZE1lc3NhZ2UgPSBtZXNzYWdlID09IG51bGwgPyAnJyA6IGAke21lc3NhZ2V9YC50cmltKCk7XG4gICAgY29uc3QgYXJpYUxhYmVsID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnKTtcblxuICAgIC8vIFdlIHNob3VsZG4ndCBzZXQgZGVzY3JpcHRpb25zIGlmIHRoZXkncmUgZXhhY3RseSB0aGUgc2FtZSBhcyB0aGUgYGFyaWEtbGFiZWxgIG9mIHRoZVxuICAgIC8vIGVsZW1lbnQsIGJlY2F1c2Ugc2NyZWVuIHJlYWRlcnMgd2lsbCBlbmQgdXAgcmVhZGluZyBvdXQgdGhlIHNhbWUgdGV4dCB0d2ljZSBpbiBhIHJvdy5cbiAgICByZXR1cm4gdHJpbW1lZE1lc3NhZ2UgPyAoIWFyaWFMYWJlbCB8fCBhcmlhTGFiZWwudHJpbSgpICE9PSB0cmltbWVkTWVzc2FnZSkgOiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciBhIG5vZGUgaXMgYW4gRWxlbWVudCBub2RlLiAqL1xuICBwcml2YXRlIF9pc0VsZW1lbnROb2RlKGVsZW1lbnQ6IE5vZGUpOiBlbGVtZW50IGlzIEVsZW1lbnQge1xuICAgIHJldHVybiBlbGVtZW50Lm5vZGVUeXBlID09PSB0aGlzLl9kb2N1bWVudC5FTEVNRU5UX05PREU7XG4gIH1cbn1cblxuLyoqIEdldHMgYSBrZXkgdGhhdCBjYW4gYmUgdXNlZCB0byBsb29rIG1lc3NhZ2VzIHVwIGluIHRoZSByZWdpc3RyeS4gKi9cbmZ1bmN0aW9uIGdldEtleShtZXNzYWdlOiBzdHJpbmd8RWxlbWVudCwgcm9sZT86IHN0cmluZyk6IHN0cmluZ3xFbGVtZW50IHtcbiAgcmV0dXJuIHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJyA/IGAke3JvbGUgfHwgJyd9LyR7bWVzc2FnZX1gIDogbWVzc2FnZTtcbn1cblxuLyoqIEFzc2lnbnMgYSB1bmlxdWUgSUQgdG8gYW4gZWxlbWVudCwgaWYgaXQgZG9lc24ndCBoYXZlIG9uZSBhbHJlYWR5LiAqL1xuZnVuY3Rpb24gc2V0TWVzc2FnZUlkKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gIGlmICghZWxlbWVudC5pZCkge1xuICAgIGVsZW1lbnQuaWQgPSBgJHtDREtfREVTQ1JJQkVEQllfSURfUFJFRklYfS0ke25leHRJZCsrfWA7XG4gIH1cbn1cbiJdfQ==
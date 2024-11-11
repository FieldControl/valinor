/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EventContractContainer } from './event_contract_container';
/**
 * An `EventContractContainerManager` that supports multiple containers.
 */
export class EventContractMultiContainer {
    /**
     * @param stopPropagation Controls whether events can bubble between
     *    containers or not.
     */
    constructor(stopPropagation = false) {
        this.stopPropagation = stopPropagation;
        /** The list of containers. */
        this.containers = [];
        /** The list of nested containers. */
        this.nestedContainers = [];
        /** The list of event handler installers. */
        this.eventHandlerInstallers = [];
    }
    /**
     * Installs the provided installer on the element owned by this container,
     * and maintains a reference to resulting handler in order to remove it
     * later if desired.
     */
    addEventListener(eventType, getHandler) {
        const eventHandlerInstaller = (container) => {
            container.addEventListener(eventType, getHandler);
        };
        for (let i = 0; i < this.containers.length; i++) {
            eventHandlerInstaller(this.containers[i]);
        }
        this.eventHandlerInstallers.push(eventHandlerInstaller);
    }
    /**
     * Removes all the handlers installed on all containers.
     */
    cleanUp() {
        const allContainers = [...this.containers, ...this.nestedContainers];
        for (let i = 0; i < allContainers.length; i++) {
            allContainers[i].cleanUp();
        }
        this.containers = [];
        this.nestedContainers = [];
        this.eventHandlerInstallers = [];
    }
    /**
     * Adds a container to the `MultiEventContractContainer`.
     * Signs the event contract for a new container. All registered events
     * are enabled for this container too. Containers have to be kept disjoint,
     * so if the newly added container is a parent/child of existing containers,
     * they will be merged. If the container is already tracked by this
     * `EventContract`, then the previously registered `EventContractContainer`
     * will be returned.
     */
    addContainer(element) {
        // If the container is already registered, return.
        for (let i = 0; i < this.containers.length; i++) {
            if (element === this.containers[i].element) {
                return this.containers[i];
            }
        }
        const container = new EventContractContainer(element);
        if (this.stopPropagation) {
            // Events are not propagated, so containers can be considered independent.
            this.setUpContainer(container);
            this.containers.push(container);
        }
        else {
            if (this.isNestedContainer(container)) {
                // This container has an ancestor that is already a contract container.
                // Don't install event listeners on it in order to prevent an event from
                // being handled multiple times.
                this.nestedContainers.push(container);
                return container;
            }
            this.setUpContainer(container);
            this.containers.push(container);
            this.updateNestedContainers();
        }
        return container;
    }
    /**
     * Removes an already-added container from the contract.
     */
    removeContainer(container) {
        container.cleanUp();
        let removed = false;
        for (let i = 0; i < this.containers.length; ++i) {
            if (this.containers[i] === container) {
                this.containers.splice(i, 1);
                removed = true;
                break;
            }
        }
        if (!removed) {
            for (let i = 0; i < this.nestedContainers.length; ++i) {
                if (this.nestedContainers[i] === container) {
                    this.nestedContainers.splice(i, 1);
                    break;
                }
            }
        }
        if (this.stopPropagation) {
            return;
        }
        this.updateNestedContainers();
    }
    /**
     * Tested whether any current container is a parent of the new container.
     */
    isNestedContainer(container) {
        for (let i = 0; i < this.containers.length; i++) {
            if (containsNode(this.containers[i].element, container.element)) {
                return true;
            }
        }
        return false;
    }
    /** Installs all existing event handlers on a new container. */
    setUpContainer(container) {
        for (let i = 0; i < this.eventHandlerInstallers.length; i++) {
            this.eventHandlerInstallers[i](container);
        }
    }
    /**
     * Updates the list of nested containers after an add/remove operation. Only
     * containers that are not children of other containers are placed in the
     * containers list (and have event listeners on them). This is done in order
     * to prevent events from being handled multiple times when `stopPropagation`
     * is false.
     */
    updateNestedContainers() {
        const allContainers = [...this.nestedContainers, ...this.containers];
        const newNestedContainers = [];
        const newContainers = [];
        for (let i = 0; i < this.containers.length; ++i) {
            const container = this.containers[i];
            if (isNested(container, allContainers)) {
                newNestedContainers.push(container);
                // Remove the event listeners from the nested container.
                container.cleanUp();
            }
            else {
                newContainers.push(container);
            }
        }
        for (let i = 0; i < this.nestedContainers.length; ++i) {
            const container = this.nestedContainers[i];
            if (isNested(container, allContainers)) {
                newNestedContainers.push(container);
            }
            else {
                newContainers.push(container);
                // The container is no longer nested, add event listeners on it.
                this.setUpContainer(container);
            }
        }
        this.containers = newContainers;
        this.nestedContainers = newNestedContainers;
    }
}
/**
 * Checks whether the container is a child of any of the containers.
 */
function isNested(container, containers) {
    for (let i = 0; i < containers.length; ++i) {
        if (containsNode(containers[i].element, container.element)) {
            return true;
        }
    }
    return false;
}
/**
 * Checks whether parent contains child.
 * IE11 only supports the native `Node.contains` for HTMLElement.
 */
function containsNode(parent, child) {
    if (parent === child) {
        return false;
    }
    while (parent !== child && child.parentNode) {
        child = child.parentNode;
    }
    return parent === child;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfY29udHJhY3RfbXVsdGlfY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9wcmltaXRpdmVzL2V2ZW50LWRpc3BhdGNoL3NyYy9ldmVudF9jb250cmFjdF9tdWx0aV9jb250YWluZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLHNCQUFzQixFQUFnQyxNQUFNLDRCQUE0QixDQUFDO0FBRWpHOztHQUVHO0FBQ0gsTUFBTSxPQUFPLDJCQUEyQjtJQVF0Qzs7O09BR0c7SUFDSCxZQUE2QixrQkFBa0IsS0FBSztRQUF2QixvQkFBZSxHQUFmLGVBQWUsQ0FBUTtRQVhwRCw4QkFBOEI7UUFDdEIsZUFBVSxHQUE2QixFQUFFLENBQUM7UUFDbEQscUNBQXFDO1FBQzdCLHFCQUFnQixHQUE2QixFQUFFLENBQUM7UUFDeEQsNENBQTRDO1FBQ3BDLDJCQUFzQixHQUF1RCxFQUFFLENBQUM7SUFNakMsQ0FBQztJQUV4RDs7OztPQUlHO0lBQ0gsZ0JBQWdCLENBQUMsU0FBaUIsRUFBRSxVQUF3RDtRQUMxRixNQUFNLHFCQUFxQixHQUFHLENBQUMsU0FBaUMsRUFBRSxFQUFFO1lBQ2xFLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDO1FBQ0YsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDaEQscUJBQXFCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFDRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVEOztP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RSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzNDLElBQUksWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDM0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsWUFBWSxDQUFDLE1BQVksRUFBRSxLQUFXO0lBQzdDLElBQUksTUFBTSxLQUFLLEtBQUssRUFBRSxDQUFDO1FBQ3JCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUNELE9BQU8sTUFBTSxLQUFLLEtBQUssSUFBSSxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDNUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUNELE9BQU8sTUFBTSxLQUFLLEtBQUssQ0FBQztBQUMxQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0V2ZW50Q29udHJhY3RDb250YWluZXIsIEV2ZW50Q29udHJhY3RDb250YWluZXJNYW5hZ2VyfSBmcm9tICcuL2V2ZW50X2NvbnRyYWN0X2NvbnRhaW5lcic7XG5cbi8qKlxuICogQW4gYEV2ZW50Q29udHJhY3RDb250YWluZXJNYW5hZ2VyYCB0aGF0IHN1cHBvcnRzIG11bHRpcGxlIGNvbnRhaW5lcnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudENvbnRyYWN0TXVsdGlDb250YWluZXIgaW1wbGVtZW50cyBFdmVudENvbnRyYWN0Q29udGFpbmVyTWFuYWdlciB7XG4gIC8qKiBUaGUgbGlzdCBvZiBjb250YWluZXJzLiAqL1xuICBwcml2YXRlIGNvbnRhaW5lcnM6IEV2ZW50Q29udHJhY3RDb250YWluZXJbXSA9IFtdO1xuICAvKiogVGhlIGxpc3Qgb2YgbmVzdGVkIGNvbnRhaW5lcnMuICovXG4gIHByaXZhdGUgbmVzdGVkQ29udGFpbmVyczogRXZlbnRDb250cmFjdENvbnRhaW5lcltdID0gW107XG4gIC8qKiBUaGUgbGlzdCBvZiBldmVudCBoYW5kbGVyIGluc3RhbGxlcnMuICovXG4gIHByaXZhdGUgZXZlbnRIYW5kbGVySW5zdGFsbGVyczogQXJyYXk8KGNvbnRhaW5lcjogRXZlbnRDb250cmFjdENvbnRhaW5lcikgPT4gdm9pZD4gPSBbXTtcblxuICAvKipcbiAgICogQHBhcmFtIHN0b3BQcm9wYWdhdGlvbiBDb250cm9scyB3aGV0aGVyIGV2ZW50cyBjYW4gYnViYmxlIGJldHdlZW5cbiAgICogICAgY29udGFpbmVycyBvciBub3QuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHN0b3BQcm9wYWdhdGlvbiA9IGZhbHNlKSB7fVxuXG4gIC8qKlxuICAgKiBJbnN0YWxscyB0aGUgcHJvdmlkZWQgaW5zdGFsbGVyIG9uIHRoZSBlbGVtZW50IG93bmVkIGJ5IHRoaXMgY29udGFpbmVyLFxuICAgKiBhbmQgbWFpbnRhaW5zIGEgcmVmZXJlbmNlIHRvIHJlc3VsdGluZyBoYW5kbGVyIGluIG9yZGVyIHRvIHJlbW92ZSBpdFxuICAgKiBsYXRlciBpZiBkZXNpcmVkLlxuICAgKi9cbiAgYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGU6IHN0cmluZywgZ2V0SGFuZGxlcjogKGVsZW1lbnQ6IEVsZW1lbnQpID0+IChldmVudDogRXZlbnQpID0+IHZvaWQpIHtcbiAgICBjb25zdCBldmVudEhhbmRsZXJJbnN0YWxsZXIgPSAoY29udGFpbmVyOiBFdmVudENvbnRyYWN0Q29udGFpbmVyKSA9PiB7XG4gICAgICBjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGdldEhhbmRsZXIpO1xuICAgIH07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbnRhaW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGV2ZW50SGFuZGxlckluc3RhbGxlcih0aGlzLmNvbnRhaW5lcnNbaV0pO1xuICAgIH1cbiAgICB0aGlzLmV2ZW50SGFuZGxlckluc3RhbGxlcnMucHVzaChldmVudEhhbmRsZXJJbnN0YWxsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYWxsIHRoZSBoYW5kbGVycyBpbnN0YWxsZWQgb24gYWxsIGNvbnRhaW5lcnMuXG4gICAqL1xuICBjbGVhblVwKCkge1xuICAgIGNvbnN0IGFsbENvbnRhaW5lcnMgPSBbLi4udGhpcy5jb250YWluZXJzLCAuLi50aGlzLm5lc3RlZENvbnRhaW5lcnNdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsQ29udGFpbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgYWxsQ29udGFpbmVyc1tpXS5jbGVhblVwKCk7XG4gICAgfVxuICAgIHRoaXMuY29udGFpbmVycyA9IFtdO1xuICAgIHRoaXMubmVzdGVkQ29udGFpbmVycyA9IFtdO1xuICAgIHRoaXMuZXZlbnRIYW5kbGVySW5zdGFsbGVycyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBjb250YWluZXIgdG8gdGhlIGBNdWx0aUV2ZW50Q29udHJhY3RDb250YWluZXJgLlxuICAgKiBTaWducyB0aGUgZXZlbnQgY29udHJhY3QgZm9yIGEgbmV3IGNvbnRhaW5lci4gQWxsIHJlZ2lzdGVyZWQgZXZlbnRzXG4gICAqIGFyZSBlbmFibGVkIGZvciB0aGlzIGNvbnRhaW5lciB0b28uIENvbnRhaW5lcnMgaGF2ZSB0byBiZSBrZXB0IGRpc2pvaW50LFxuICAgKiBzbyBpZiB0aGUgbmV3bHkgYWRkZWQgY29udGFpbmVyIGlzIGEgcGFyZW50L2NoaWxkIG9mIGV4aXN0aW5nIGNvbnRhaW5lcnMsXG4gICAqIHRoZXkgd2lsbCBiZSBtZXJnZWQuIElmIHRoZSBjb250YWluZXIgaXMgYWxyZWFkeSB0cmFja2VkIGJ5IHRoaXNcbiAgICogYEV2ZW50Q29udHJhY3RgLCB0aGVuIHRoZSBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgYEV2ZW50Q29udHJhY3RDb250YWluZXJgXG4gICAqIHdpbGwgYmUgcmV0dXJuZWQuXG4gICAqL1xuICBhZGRDb250YWluZXIoZWxlbWVudDogRWxlbWVudCk6IEV2ZW50Q29udHJhY3RDb250YWluZXIge1xuICAgIC8vIElmIHRoZSBjb250YWluZXIgaXMgYWxyZWFkeSByZWdpc3RlcmVkLCByZXR1cm4uXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbnRhaW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChlbGVtZW50ID09PSB0aGlzLmNvbnRhaW5lcnNbaV0uZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXJzW2ldO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBjb250YWluZXIgPSBuZXcgRXZlbnRDb250cmFjdENvbnRhaW5lcihlbGVtZW50KTtcbiAgICBpZiAodGhpcy5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICAgIC8vIEV2ZW50cyBhcmUgbm90IHByb3BhZ2F0ZWQsIHNvIGNvbnRhaW5lcnMgY2FuIGJlIGNvbnNpZGVyZWQgaW5kZXBlbmRlbnQuXG4gICAgICB0aGlzLnNldFVwQ29udGFpbmVyKGNvbnRhaW5lcik7XG4gICAgICB0aGlzLmNvbnRhaW5lcnMucHVzaChjb250YWluZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5pc05lc3RlZENvbnRhaW5lcihjb250YWluZXIpKSB7XG4gICAgICAgIC8vIFRoaXMgY29udGFpbmVyIGhhcyBhbiBhbmNlc3RvciB0aGF0IGlzIGFscmVhZHkgYSBjb250cmFjdCBjb250YWluZXIuXG4gICAgICAgIC8vIERvbid0IGluc3RhbGwgZXZlbnQgbGlzdGVuZXJzIG9uIGl0IGluIG9yZGVyIHRvIHByZXZlbnQgYW4gZXZlbnQgZnJvbVxuICAgICAgICAvLyBiZWluZyBoYW5kbGVkIG11bHRpcGxlIHRpbWVzLlxuICAgICAgICB0aGlzLm5lc3RlZENvbnRhaW5lcnMucHVzaChjb250YWluZXIpO1xuICAgICAgICByZXR1cm4gY29udGFpbmVyO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRVcENvbnRhaW5lcihjb250YWluZXIpO1xuICAgICAgdGhpcy5jb250YWluZXJzLnB1c2goY29udGFpbmVyKTtcbiAgICAgIHRoaXMudXBkYXRlTmVzdGVkQ29udGFpbmVycygpO1xuICAgIH1cbiAgICByZXR1cm4gY29udGFpbmVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYW4gYWxyZWFkeS1hZGRlZCBjb250YWluZXIgZnJvbSB0aGUgY29udHJhY3QuXG4gICAqL1xuICByZW1vdmVDb250YWluZXIoY29udGFpbmVyOiBFdmVudENvbnRyYWN0Q29udGFpbmVyKSB7XG4gICAgY29udGFpbmVyLmNsZWFuVXAoKTtcbiAgICBsZXQgcmVtb3ZlZCA9IGZhbHNlO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb250YWluZXJzLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAodGhpcy5jb250YWluZXJzW2ldID09PSBjb250YWluZXIpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgcmVtb3ZlZCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghcmVtb3ZlZCkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm5lc3RlZENvbnRhaW5lcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgaWYgKHRoaXMubmVzdGVkQ29udGFpbmVyc1tpXSA9PT0gY29udGFpbmVyKSB7XG4gICAgICAgICAgdGhpcy5uZXN0ZWRDb250YWluZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLnN0b3BQcm9wYWdhdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZU5lc3RlZENvbnRhaW5lcnMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUZXN0ZWQgd2hldGhlciBhbnkgY3VycmVudCBjb250YWluZXIgaXMgYSBwYXJlbnQgb2YgdGhlIG5ldyBjb250YWluZXIuXG4gICAqL1xuICBwcml2YXRlIGlzTmVzdGVkQ29udGFpbmVyKGNvbnRhaW5lcjogRXZlbnRDb250cmFjdENvbnRhaW5lcik6IGJvb2xlYW4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb250YWluZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoY29udGFpbnNOb2RlKHRoaXMuY29udGFpbmVyc1tpXS5lbGVtZW50LCBjb250YWluZXIuZWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBJbnN0YWxscyBhbGwgZXhpc3RpbmcgZXZlbnQgaGFuZGxlcnMgb24gYSBuZXcgY29udGFpbmVyLiAqL1xuICBwcml2YXRlIHNldFVwQ29udGFpbmVyKGNvbnRhaW5lcjogRXZlbnRDb250cmFjdENvbnRhaW5lcikge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ldmVudEhhbmRsZXJJbnN0YWxsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLmV2ZW50SGFuZGxlckluc3RhbGxlcnNbaV0oY29udGFpbmVyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgbGlzdCBvZiBuZXN0ZWQgY29udGFpbmVycyBhZnRlciBhbiBhZGQvcmVtb3ZlIG9wZXJhdGlvbi4gT25seVxuICAgKiBjb250YWluZXJzIHRoYXQgYXJlIG5vdCBjaGlsZHJlbiBvZiBvdGhlciBjb250YWluZXJzIGFyZSBwbGFjZWQgaW4gdGhlXG4gICAqIGNvbnRhaW5lcnMgbGlzdCAoYW5kIGhhdmUgZXZlbnQgbGlzdGVuZXJzIG9uIHRoZW0pLiBUaGlzIGlzIGRvbmUgaW4gb3JkZXJcbiAgICogdG8gcHJldmVudCBldmVudHMgZnJvbSBiZWluZyBoYW5kbGVkIG11bHRpcGxlIHRpbWVzIHdoZW4gYHN0b3BQcm9wYWdhdGlvbmBcbiAgICogaXMgZmFsc2UuXG4gICAqL1xuICBwcml2YXRlIHVwZGF0ZU5lc3RlZENvbnRhaW5lcnMoKSB7XG4gICAgY29uc3QgYWxsQ29udGFpbmVycyA9IFsuLi50aGlzLm5lc3RlZENvbnRhaW5lcnMsIC4uLnRoaXMuY29udGFpbmVyc107XG4gICAgY29uc3QgbmV3TmVzdGVkQ29udGFpbmVycyA9IFtdO1xuICAgIGNvbnN0IG5ld0NvbnRhaW5lcnMgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb250YWluZXJzLmxlbmd0aDsgKytpKSB7XG4gICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lcnNbaV07XG4gICAgICBpZiAoaXNOZXN0ZWQoY29udGFpbmVyLCBhbGxDb250YWluZXJzKSkge1xuICAgICAgICBuZXdOZXN0ZWRDb250YWluZXJzLnB1c2goY29udGFpbmVyKTtcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBldmVudCBsaXN0ZW5lcnMgZnJvbSB0aGUgbmVzdGVkIGNvbnRhaW5lci5cbiAgICAgICAgY29udGFpbmVyLmNsZWFuVXAoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld0NvbnRhaW5lcnMucHVzaChjb250YWluZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5uZXN0ZWRDb250YWluZXJzLmxlbmd0aDsgKytpKSB7XG4gICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLm5lc3RlZENvbnRhaW5lcnNbaV07XG4gICAgICBpZiAoaXNOZXN0ZWQoY29udGFpbmVyLCBhbGxDb250YWluZXJzKSkge1xuICAgICAgICBuZXdOZXN0ZWRDb250YWluZXJzLnB1c2goY29udGFpbmVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld0NvbnRhaW5lcnMucHVzaChjb250YWluZXIpO1xuICAgICAgICAvLyBUaGUgY29udGFpbmVyIGlzIG5vIGxvbmdlciBuZXN0ZWQsIGFkZCBldmVudCBsaXN0ZW5lcnMgb24gaXQuXG4gICAgICAgIHRoaXMuc2V0VXBDb250YWluZXIoY29udGFpbmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmNvbnRhaW5lcnMgPSBuZXdDb250YWluZXJzO1xuICAgIHRoaXMubmVzdGVkQ29udGFpbmVycyA9IG5ld05lc3RlZENvbnRhaW5lcnM7XG4gIH1cbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgY29udGFpbmVyIGlzIGEgY2hpbGQgb2YgYW55IG9mIHRoZSBjb250YWluZXJzLlxuICovXG5mdW5jdGlvbiBpc05lc3RlZChcbiAgY29udGFpbmVyOiBFdmVudENvbnRyYWN0Q29udGFpbmVyLFxuICBjb250YWluZXJzOiBFdmVudENvbnRyYWN0Q29udGFpbmVyW10sXG4pOiBib29sZWFuIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb250YWluZXJzLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKGNvbnRhaW5zTm9kZShjb250YWluZXJzW2ldLmVsZW1lbnQsIGNvbnRhaW5lci5lbGVtZW50KSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHBhcmVudCBjb250YWlucyBjaGlsZC5cbiAqIElFMTEgb25seSBzdXBwb3J0cyB0aGUgbmF0aXZlIGBOb2RlLmNvbnRhaW5zYCBmb3IgSFRNTEVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGNvbnRhaW5zTm9kZShwYXJlbnQ6IE5vZGUsIGNoaWxkOiBOb2RlKTogYm9vbGVhbiB7XG4gIGlmIChwYXJlbnQgPT09IGNoaWxkKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHdoaWxlIChwYXJlbnQgIT09IGNoaWxkICYmIGNoaWxkLnBhcmVudE5vZGUpIHtcbiAgICBjaGlsZCA9IGNoaWxkLnBhcmVudE5vZGU7XG4gIH1cbiAgcmV0dXJuIHBhcmVudCA9PT0gY2hpbGQ7XG59XG4iXX0=
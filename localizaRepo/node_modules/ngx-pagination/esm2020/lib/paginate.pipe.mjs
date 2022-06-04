import { Pipe } from "@angular/core";
import * as i0 from "@angular/core";
import * as i1 from "./pagination.service";
const LARGE_NUMBER = Number.MAX_SAFE_INTEGER;
export class PaginatePipe {
    constructor(service) {
        this.service = service;
        // store the values from the last time the pipe was invoked
        this.state = {};
    }
    transform(collection, args) {
        // When an observable is passed through the AsyncPipe, it will output
        // `null` until the subscription resolves. In this case, we want to
        // use the cached data from the `state` object to prevent the NgFor
        // from flashing empty until the real values arrive.
        if (!(collection instanceof Array)) {
            let _id = args.id || this.service.defaultId();
            if (this.state[_id]) {
                return this.state[_id].slice;
            }
            else {
                return collection;
            }
        }
        let serverSideMode = args.totalItems && args.totalItems !== collection.length;
        let instance = this.createInstance(collection, args);
        let id = instance.id;
        let start, end;
        let perPage = instance.itemsPerPage;
        let emitChange = this.service.register(instance);
        if (!serverSideMode && collection instanceof Array) {
            perPage = +perPage || LARGE_NUMBER;
            start = (instance.currentPage - 1) * perPage;
            end = start + perPage;
            let isIdentical = this.stateIsIdentical(id, collection, start, end);
            if (isIdentical) {
                return this.state[id].slice;
            }
            else {
                let slice = collection.slice(start, end);
                this.saveState(id, collection, slice, start, end);
                this.service.change.emit(id);
                return slice;
            }
        }
        else {
            if (emitChange) {
                this.service.change.emit(id);
            }
            // save the state for server-side collection to avoid null
            // flash as new data loads.
            this.saveState(id, collection, collection, start, end);
            return collection;
        }
    }
    /**
     * Create an PaginationInstance object, using defaults for any optional properties not supplied.
     */
    createInstance(collection, config) {
        this.checkConfig(config);
        return {
            id: config.id != null ? config.id : this.service.defaultId(),
            itemsPerPage: +config.itemsPerPage || 0,
            currentPage: +config.currentPage || 1,
            totalItems: +config.totalItems || collection.length
        };
    }
    /**
     * Ensure the argument passed to the filter contains the required properties.
     */
    checkConfig(config) {
        const required = ['itemsPerPage', 'currentPage'];
        const missing = required.filter(prop => !(prop in config));
        if (0 < missing.length) {
            throw new Error(`PaginatePipe: Argument is missing the following required properties: ${missing.join(', ')}`);
        }
    }
    /**
     * To avoid returning a brand new array each time the pipe is run, we store the state of the sliced
     * array for a given id. This means that the next time the pipe is run on this collection & id, we just
     * need to check that the collection, start and end points are all identical, and if so, return the
     * last sliced array.
     */
    saveState(id, collection, slice, start, end) {
        this.state[id] = {
            collection,
            size: collection.length,
            slice,
            start,
            end
        };
    }
    /**
     * For a given id, returns true if the collection, size, start and end values are identical.
     */
    stateIsIdentical(id, collection, start, end) {
        let state = this.state[id];
        if (!state) {
            return false;
        }
        let isMetaDataIdentical = state.size === collection.length &&
            state.start === start &&
            state.end === end;
        if (!isMetaDataIdentical) {
            return false;
        }
        return state.slice.every((element, index) => element === collection[start + index]);
    }
}
PaginatePipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: PaginatePipe, deps: [{ token: i1.PaginationService }], target: i0.ɵɵFactoryTarget.Pipe });
PaginatePipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: PaginatePipe, name: "paginate", pure: false });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.9", ngImport: i0, type: PaginatePipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'paginate',
                    pure: false
                }]
        }], ctorParameters: function () { return [{ type: i1.PaginationService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdGUucGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1wYWdpbmF0aW9uL3NyYy9saWIvcGFnaW5hdGUucGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sZUFBZSxDQUFDOzs7QUFJbkMsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO0FBdUI3QyxNQUFNLE9BQU8sWUFBWTtJQUtyQixZQUFvQixPQUEwQjtRQUExQixZQUFPLEdBQVAsT0FBTyxDQUFtQjtRQUg5QywyREFBMkQ7UUFDbkQsVUFBSyxHQUFnQyxFQUFFLENBQUM7SUFHaEQsQ0FBQztJQUVNLFNBQVMsQ0FBNkIsVUFBYSxFQUFFLElBQXNCO1FBRTlFLHFFQUFxRTtRQUNyRSxtRUFBbUU7UUFDbkUsbUVBQW1FO1FBQ25FLG9EQUFvRDtRQUNwRCxJQUFJLENBQUMsQ0FBQyxVQUFVLFlBQVksS0FBSyxDQUFDLEVBQUU7WUFDaEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzlDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDakIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQVUsQ0FBQzthQUNyQztpQkFBTTtnQkFDSCxPQUFPLFVBQVUsQ0FBQzthQUNyQjtTQUNKO1FBRUQsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFDOUUsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDckQsSUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUNy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VTtZQUNWLElBQUksRUFBRSxVQUFVLENBQUMsTUFBTTtZQUN2QixLQUFLO1lBQ0wsS0FBSztZQUNMLEdBQUc7U0FDTixDQUFDO0lBQ04sQ0FBQztJQUVEOztPQUVHO0lBQ0ssZ0JBQWdCLENBQUMsRUFBVSxFQUFFLFVBQTBCLEVBQUUsS0FBYSxFQUFFLEdBQVc7UUFDdkYsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFDRCxJQUFJLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDLE1BQU07WUFDdEQsS0FBSyxDQUFDLEtBQUssS0FBSyxLQUFLO1lBQ3JCLEtBQUssQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDO1FBRXRCLElBQUcsQ0FBQyxtQkFBbUIsRUFBRTtZQUNyQixPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUVELE9BQVEsS0FBSyxDQUFDLEtBQW9CLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsT0FBTyxLQUFLLFVBQVUsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN4RyxDQUFDOzt5R0FySFEsWUFBWTt1R0FBWixZQUFZOzJGQUFaLFlBQVk7a0JBSnhCLElBQUk7bUJBQUM7b0JBQ0YsSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLElBQUksRUFBRSxLQUFLO2lCQUNkIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQaXBlfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQge1BhZ2luYXRpb25TZXJ2aWNlfSBmcm9tIFwiLi9wYWdpbmF0aW9uLnNlcnZpY2VcIjtcclxuaW1wb3J0IHtQYWdpbmF0aW9uSW5zdGFuY2V9IGZyb20gJy4vcGFnaW5hdGlvbi1pbnN0YW5jZSc7XHJcblxyXG5jb25zdCBMQVJHRV9OVU1CRVIgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcclxuXHJcbmV4cG9ydCB0eXBlIENvbGxlY3Rpb248VD4gPSBUW10gfCBSZWFkb25seUFycmF5PFQ+O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBQYWdpbmF0ZVBpcGVBcmdzIHtcclxuICAgIGlkPzogc3RyaW5nO1xyXG4gICAgaXRlbXNQZXJQYWdlPzogc3RyaW5nIHwgbnVtYmVyO1xyXG4gICAgY3VycmVudFBhZ2U/OiBzdHJpbmcgfCBudW1iZXI7XHJcbiAgICB0b3RhbEl0ZW1zPzogc3RyaW5nIHwgbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFBpcGVTdGF0ZSB7XHJcbiAgICBjb2xsZWN0aW9uOiBBcnJheUxpa2U8YW55PjtcclxuICAgIHNpemU6IG51bWJlcjtcclxuICAgIHN0YXJ0OiBudW1iZXI7XHJcbiAgICBlbmQ6IG51bWJlcjtcclxuICAgIHNsaWNlOiBBcnJheUxpa2U8YW55PjtcclxufVxyXG5cclxuQFBpcGUoe1xyXG4gICAgbmFtZTogJ3BhZ2luYXRlJyxcclxuICAgIHB1cmU6IGZhbHNlXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBQYWdpbmF0ZVBpcGUge1xyXG5cclxuICAgIC8vIHN0b3JlIHRoZSB2YWx1ZXMgZnJvbSB0aGUgbGFzdCB0aW1lIHRoZSBwaXBlIHdhcyBpbnZva2VkXHJcbiAgICBwcml2YXRlIHN0YXRlOiB7IFtpZDogc3RyaW5nXTogUGlwZVN0YXRlIH0gPSB7fTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHNlcnZpY2U6IFBhZ2luYXRpb25TZXJ2aWNlKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRyYW5zZm9ybTxULCBVIGV4dGVuZHMgQ29sbGVjdGlvbjxUPj4oY29sbGVjdGlvbjogVSwgYXJnczogUGFnaW5hdGVQaXBlQXJncyk6IFUge1xyXG5cclxuICAgICAgICAvLyBXaGVuIGFuIG9ic2VydmFibGUgaXMgcGFzc2VkIHRocm91Z2ggdGhlIEFzeW5jUGlwZSwgaXQgd2lsbCBvdXRwdXRcclxuICAgICAgICAvLyBgbnVsbGAgdW50aWwgdGhlIHN1YnNjcmlwdGlvbiByZXNvbHZlcy4gSW4gdGhpcyBjYXNlLCB3ZSB3YW50IHRvXHJcbiAgICAgICAgLy8gdXNlIHRoZSBjYWNoZWQgZGF0YSBmcm9tIHRoZSBgc3RhdGVgIG9iamVjdCB0byBwcmV2ZW50IHRoZSBOZ0ZvclxyXG4gICAgICAgIC8vIGZyb20gZmxhc2hpbmcgZW1wdHkgdW50aWwgdGhlIHJlYWwgdmFsdWVzIGFycml2ZS5cclxuICAgICAgICBpZiAoIShjb2xsZWN0aW9uIGluc3RhbmNlb2YgQXJyYXkpKSB7XHJcbiAgICAgICAgICAgIGxldCBfaWQgPSBhcmdzLmlkIHx8IHRoaXMuc2VydmljZS5kZWZhdWx0SWQoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGVbX2lkXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGVbX2lkXS5zbGljZSBhcyBVO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzZXJ2ZXJTaWRlTW9kZSA9IGFyZ3MudG90YWxJdGVtcyAmJiBhcmdzLnRvdGFsSXRlbXMgIT09IGNvbGxlY3Rpb24ubGVuZ3RoO1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXMuY3JlYXRlSW5zdGFuY2UoY29sbGVjdGlvbiwgYXJncyk7XHJcbiAgICAgICAgbGV0IGlkID0gaW5zdGFuY2UuaWQ7XHJcbiAgICAgICAgbGV0IHN0YXJ0LCBlbmQ7XHJcbiAgICAgICAgbGV0IHBlclBhZ2UgPSBpbnN0YW5jZS5pdGVtc1BlclBhZ2U7XHJcblxyXG4gICAgICAgIGxldCBlbWl0Q2hhbmdlID0gdGhpcy5zZXJ2aWNlLnJlZ2lzdGVyKGluc3RhbmNlKTtcclxuXHJcbiAgICAgICAgaWYgKCFzZXJ2ZXJTaWRlTW9kZSAmJiBjb2xsZWN0aW9uIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgcGVyUGFnZSA9ICtwZXJQYWdlIHx8IExBUkdFX05VTUJFUjtcclxuICAgICAgICAgICAgc3RhcnQgPSAoaW5zdGFuY2UuY3VycmVudFBhZ2UgLSAxKSAqIHBlclBhZ2U7XHJcbiAgICAgICAgICAgIGVuZCA9IHN0YXJ0ICsgcGVyUGFnZTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpc0lkZW50aWNhbCA9IHRoaXMuc3RhdGVJc0lkZW50aWNhbChpZCwgY29sbGVjdGlvbiwgc3RhcnQsIGVuZCk7XHJcbiAgICAgICAgICAgIGlmIChpc0lkZW50aWNhbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGVbaWRdLnNsaWNlIGFzIFU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2xpY2UgPSBjb2xsZWN0aW9uLnNsaWNlKHN0YXJ0LCBlbmQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zYXZlU3RhdGUoaWQsIGNvbGxlY3Rpb24sIHNsaWNlLCBzdGFydCwgZW5kKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VydmljZS5jaGFuZ2UuZW1pdChpZCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2xpY2UgYXMgVTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChlbWl0Q2hhbmdlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlcnZpY2UuY2hhbmdlLmVtaXQoaWQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBzYXZlIHRoZSBzdGF0ZSBmb3Igc2VydmVyLXNpZGUgY29sbGVjdGlvbiB0byBhdm9pZCBudWxsXHJcbiAgICAgICAgICAgIC8vIGZsYXNoIGFzIG5ldyBkYXRhIGxvYWRzLlxyXG4gICAgICAgICAgICB0aGlzLnNhdmVTdGF0ZShpZCwgY29sbGVjdGlvbiwgY29sbGVjdGlvbiwgc3RhcnQsIGVuZCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYW4gUGFnaW5hdGlvbkluc3RhbmNlIG9iamVjdCwgdXNpbmcgZGVmYXVsdHMgZm9yIGFueSBvcHRpb25hbCBwcm9wZXJ0aWVzIG5vdCBzdXBwbGllZC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjcmVhdGVJbnN0YW5jZShjb2xsZWN0aW9uOiByZWFkb25seSBhbnlbXSwgY29uZmlnOiBQYWdpbmF0ZVBpcGVBcmdzKTogUGFnaW5hdGlvbkluc3RhbmNlIHtcclxuICAgICAgICB0aGlzLmNoZWNrQ29uZmlnKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlkOiBjb25maWcuaWQgIT0gbnVsbCA/IGNvbmZpZy5pZCA6IHRoaXMuc2VydmljZS5kZWZhdWx0SWQoKSxcclxuICAgICAgICAgICAgaXRlbXNQZXJQYWdlOiArY29uZmlnLml0ZW1zUGVyUGFnZSB8fCAwLFxyXG4gICAgICAgICAgICBjdXJyZW50UGFnZTogK2NvbmZpZy5jdXJyZW50UGFnZSB8fCAxLFxyXG4gICAgICAgICAgICB0b3RhbEl0ZW1zOiArY29uZmlnLnRvdGFsSXRlbXMgfHwgY29sbGVjdGlvbi5sZW5ndGhcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRW5zdXJlIHRoZSBhcmd1bWVudCBwYXNzZWQgdG8gdGhlIGZpbHRlciBjb250YWlucyB0aGUgcmVxdWlyZWQgcHJvcGVydGllcy5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjaGVja0NvbmZpZyhjb25maWc6IFBhZ2luYXRlUGlwZUFyZ3MpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCByZXF1aXJlZCA9IFsnaXRlbXNQZXJQYWdlJywgJ2N1cnJlbnRQYWdlJ107XHJcblxyXG4gICAgICAgIGNvbnN0IG1pc3NpbmcgPSByZXF1aXJlZC5maWx0ZXIocHJvcCA9PiAhKHByb3AgaW4gY29uZmlnKSk7XHJcbiAgICAgICAgaWYgKDAgPCBtaXNzaW5nLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBhZ2luYXRlUGlwZTogQXJndW1lbnQgaXMgbWlzc2luZyB0aGUgZm9sbG93aW5nIHJlcXVpcmVkIHByb3BlcnRpZXM6ICR7bWlzc2luZy5qb2luKCcsICcpfWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvIGF2b2lkIHJldHVybmluZyBhIGJyYW5kIG5ldyBhcnJheSBlYWNoIHRpbWUgdGhlIHBpcGUgaXMgcnVuLCB3ZSBzdG9yZSB0aGUgc3RhdGUgb2YgdGhlIHNsaWNlZFxyXG4gICAgICogYXJyYXkgZm9yIGEgZ2l2ZW4gaWQuIFRoaXMgbWVhbnMgdGhhdCB0aGUgbmV4dCB0aW1lIHRoZSBwaXBlIGlzIHJ1biBvbiB0aGlzIGNvbGxlY3Rpb24gJiBpZCwgd2UganVzdFxyXG4gICAgICogbmVlZCB0byBjaGVjayB0aGF0IHRoZSBjb2xsZWN0aW9uLCBzdGFydCBhbmQgZW5kIHBvaW50cyBhcmUgYWxsIGlkZW50aWNhbCwgYW5kIGlmIHNvLCByZXR1cm4gdGhlXHJcbiAgICAgKiBsYXN0IHNsaWNlZCBhcnJheS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzYXZlU3RhdGUoaWQ6IHN0cmluZywgY29sbGVjdGlvbjogQXJyYXlMaWtlPGFueT4sIHNsaWNlOiBBcnJheUxpa2U8YW55Piwgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnN0YXRlW2lkXSA9IHtcclxuICAgICAgICAgICAgY29sbGVjdGlvbixcclxuICAgICAgICAgICAgc2l6ZTogY29sbGVjdGlvbi5sZW5ndGgsXHJcbiAgICAgICAgICAgIHNsaWNlLFxyXG4gICAgICAgICAgICBzdGFydCxcclxuICAgICAgICAgICAgZW5kXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZvciBhIGdpdmVuIGlkLCByZXR1cm5zIHRydWUgaWYgdGhlIGNvbGxlY3Rpb24sIHNpemUsIHN0YXJ0IGFuZCBlbmQgdmFsdWVzIGFyZSBpZGVudGljYWwuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc3RhdGVJc0lkZW50aWNhbChpZDogc3RyaW5nLCBjb2xsZWN0aW9uOiBBcnJheUxpa2U8YW55Piwgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgc3RhdGUgPSB0aGlzLnN0YXRlW2lkXTtcclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGlzTWV0YURhdGFJZGVudGljYWwgPSBzdGF0ZS5zaXplID09PSBjb2xsZWN0aW9uLmxlbmd0aCAmJlxyXG4gICAgICAgICAgICBzdGF0ZS5zdGFydCA9PT0gc3RhcnQgJiZcclxuICAgICAgICAgICAgc3RhdGUuZW5kID09PSBlbmQ7XHJcblxyXG4gICAgICAgIGlmKCFpc01ldGFEYXRhSWRlbnRpY2FsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAoc3RhdGUuc2xpY2UgYXMgQXJyYXk8YW55PikuZXZlcnkoKGVsZW1lbnQsIGluZGV4KSA9PiBlbGVtZW50ID09PSBjb2xsZWN0aW9uW3N0YXJ0ICsgaW5kZXhdKTtcclxuICAgIH1cclxufVxyXG4iXX0=
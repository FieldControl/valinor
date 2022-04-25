import { EventEmitter } from '@angular/core';
import { PaginationInstance } from './pagination-instance';
export declare class PaginationService {
    change: EventEmitter<string>;
    private instances;
    private DEFAULT_ID;
    defaultId(): string;
    /**
     * Register a PaginationInstance with this service. Returns a
     * boolean value signifying whether the instance is new or
     * updated (true = new or updated, false = unchanged).
     */
    register(instance: PaginationInstance): boolean;
    /**
     * Check each property of the instance and update any that have changed. Return
     * true if any changes were made, else return false.
     */
    private updateInstance;
    /**
     * Returns the current page number.
     */
    getCurrentPage(id: string): number;
    /**
     * Sets the current page number.
     */
    setCurrentPage(id: string, page: number): void;
    /**
     * Sets the value of instance.totalItems
     */
    setTotalItems(id: string, totalItems: number): void;
    /**
     * Sets the value of instance.itemsPerPage.
     */
    setItemsPerPage(id: string, itemsPerPage: number): void;
    /**
     * Returns a clone of the pagination instance object matching the id. If no
     * id specified, returns the instance corresponding to the default id.
     */
    getInstance(id?: string): PaginationInstance;
    /**
     * Perform a shallow clone of an object.
     */
    private clone;
}

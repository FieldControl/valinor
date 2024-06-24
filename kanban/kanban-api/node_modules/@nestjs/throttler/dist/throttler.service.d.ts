import { OnApplicationShutdown } from '@nestjs/common';
import { ThrottlerStorageOptions } from './throttler-storage-options.interface';
import { ThrottlerStorageRecord } from './throttler-storage-record.interface';
import { ThrottlerStorage } from './throttler-storage.interface';
export declare class ThrottlerStorageService implements ThrottlerStorage, OnApplicationShutdown {
    private _storage;
    private timeoutIds;
    get storage(): Record<string, ThrottlerStorageOptions>;
    private getExpirationTime;
    private setExpirationTime;
    increment(key: string, ttl: number): Promise<ThrottlerStorageRecord>;
    onApplicationShutdown(): void;
}

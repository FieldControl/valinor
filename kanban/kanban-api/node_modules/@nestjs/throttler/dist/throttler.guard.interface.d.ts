import { ThrottlerStorageRecord } from './throttler-storage-record.interface';
export interface ThrottlerLimitDetail extends ThrottlerStorageRecord {
    ttl: number;
    limit: number;
    key: string;
    tracker: string;
}

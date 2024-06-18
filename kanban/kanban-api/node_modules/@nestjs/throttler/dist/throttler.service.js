"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrottlerStorageService = void 0;
const common_1 = require("@nestjs/common");
let ThrottlerStorageService = class ThrottlerStorageService {
    constructor() {
        this._storage = {};
        this.timeoutIds = [];
    }
    get storage() {
        return this._storage;
    }
    getExpirationTime(key) {
        return Math.floor((this.storage[key].expiresAt - Date.now()) / 1000);
    }
    setExpirationTime(key, ttlMilliseconds) {
        const timeoutId = setTimeout(() => {
            this.storage[key].totalHits--;
            clearTimeout(timeoutId);
            this.timeoutIds = this.timeoutIds.filter((id) => id != timeoutId);
        }, ttlMilliseconds);
        this.timeoutIds.push(timeoutId);
    }
    async increment(key, ttl) {
        const ttlMilliseconds = ttl;
        if (!this.storage[key]) {
            this.storage[key] = { totalHits: 0, expiresAt: Date.now() + ttlMilliseconds };
        }
        let timeToExpire = this.getExpirationTime(key);
        if (timeToExpire <= 0) {
            this.storage[key].expiresAt = Date.now() + ttlMilliseconds;
            timeToExpire = this.getExpirationTime(key);
        }
        this.storage[key].totalHits++;
        this.setExpirationTime(key, ttlMilliseconds);
        return {
            totalHits: this.storage[key].totalHits,
            timeToExpire,
        };
    }
    onApplicationShutdown() {
        this.timeoutIds.forEach(clearTimeout);
    }
};
exports.ThrottlerStorageService = ThrottlerStorageService;
exports.ThrottlerStorageService = ThrottlerStorageService = __decorate([
    (0, common_1.Injectable)()
], ThrottlerStorageService);
//# sourceMappingURL=throttler.service.js.map
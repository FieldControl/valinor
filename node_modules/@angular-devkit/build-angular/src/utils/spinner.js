"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Spinner_isTTY;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spinner = void 0;
const ora_1 = __importDefault(require("ora"));
const color_1 = require("./color");
const tty_1 = require("./tty");
class Spinner {
    constructor(text) {
        /** When false, only fail messages will be displayed. */
        this.enabled = true;
        _Spinner_isTTY.set(this, (0, tty_1.isTTY)());
        this.spinner = (0, ora_1.default)({
            text,
            // The below 2 options are needed because otherwise CTRL+C will be delayed
            // when the underlying process is sync.
            hideCursor: false,
            discardStdin: false,
            isEnabled: __classPrivateFieldGet(this, _Spinner_isTTY, "f"),
        });
    }
    set text(text) {
        this.spinner.text = text;
    }
    get isSpinning() {
        return this.spinner.isSpinning || !__classPrivateFieldGet(this, _Spinner_isTTY, "f");
    }
    succeed(text) {
        if (this.enabled) {
            this.spinner.succeed(text);
        }
    }
    fail(text) {
        this.spinner.fail(text && color_1.colors.redBright(text));
    }
    stop() {
        this.spinner.stop();
    }
    start(text) {
        if (this.enabled) {
            this.spinner.start(text);
        }
    }
}
exports.Spinner = Spinner;
_Spinner_isTTY = new WeakMap();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Bpbm5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL3V0aWxzL3NwaW5uZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0FBRUgsOENBQXNCO0FBQ3RCLG1DQUFpQztBQUNqQywrQkFBOEI7QUFFOUIsTUFBYSxPQUFPO0lBT2xCLFlBQVksSUFBYTtRQUp6Qix3REFBd0Q7UUFDeEQsWUFBTyxHQUFHLElBQUksQ0FBQztRQUNmLHlCQUFrQixJQUFBLFdBQUssR0FBRSxFQUFDO1FBR3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBQSxhQUFHLEVBQUM7WUFDakIsSUFBSTtZQUNKLDBFQUEwRTtZQUMxRSx1Q0FBdUM7WUFDdkMsVUFBVSxFQUFFLEtBQUs7WUFDakIsWUFBWSxFQUFFLEtBQUs7WUFDbkIsU0FBUyxFQUFFLHVCQUFBLElBQUksc0JBQU87U0FDdkIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELElBQUksSUFBSSxDQUFDLElBQVk7UUFDbkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQzNCLENBQUM7SUFFRCxJQUFJLFVBQVU7UUFDWixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLENBQUMsdUJBQUEsSUFBSSxzQkFBTyxDQUFDO0lBQ2pELENBQUM7SUFFRCxPQUFPLENBQUMsSUFBYTtRQUNuQixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDNUI7SUFDSCxDQUFDO0lBRUQsSUFBSSxDQUFDLElBQWE7UUFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLGNBQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQsSUFBSTtRQUNGLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFhO1FBQ2pCLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMxQjtJQUNILENBQUM7Q0FDRjtBQTdDRCwwQkE2Q0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IG9yYSBmcm9tICdvcmEnO1xuaW1wb3J0IHsgY29sb3JzIH0gZnJvbSAnLi9jb2xvcic7XG5pbXBvcnQgeyBpc1RUWSB9IGZyb20gJy4vdHR5JztcblxuZXhwb3J0IGNsYXNzIFNwaW5uZXIge1xuICBwcml2YXRlIHJlYWRvbmx5IHNwaW5uZXI6IG9yYS5PcmE7XG5cbiAgLyoqIFdoZW4gZmFsc2UsIG9ubHkgZmFpbCBtZXNzYWdlcyB3aWxsIGJlIGRpc3BsYXllZC4gKi9cbiAgZW5hYmxlZCA9IHRydWU7XG4gIHJlYWRvbmx5ICNpc1RUWSA9IGlzVFRZKCk7XG5cbiAgY29uc3RydWN0b3IodGV4dD86IHN0cmluZykge1xuICAgIHRoaXMuc3Bpbm5lciA9IG9yYSh7XG4gICAgICB0ZXh0LFxuICAgICAgLy8gVGhlIGJlbG93IDIgb3B0aW9ucyBhcmUgbmVlZGVkIGJlY2F1c2Ugb3RoZXJ3aXNlIENUUkwrQyB3aWxsIGJlIGRlbGF5ZWRcbiAgICAgIC8vIHdoZW4gdGhlIHVuZGVybHlpbmcgcHJvY2VzcyBpcyBzeW5jLlxuICAgICAgaGlkZUN1cnNvcjogZmFsc2UsXG4gICAgICBkaXNjYXJkU3RkaW46IGZhbHNlLFxuICAgICAgaXNFbmFibGVkOiB0aGlzLiNpc1RUWSxcbiAgICB9KTtcbiAgfVxuXG4gIHNldCB0ZXh0KHRleHQ6IHN0cmluZykge1xuICAgIHRoaXMuc3Bpbm5lci50ZXh0ID0gdGV4dDtcbiAgfVxuXG4gIGdldCBpc1NwaW5uaW5nKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNwaW5uZXIuaXNTcGlubmluZyB8fCAhdGhpcy4jaXNUVFk7XG4gIH1cblxuICBzdWNjZWVkKHRleHQ/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5lbmFibGVkKSB7XG4gICAgICB0aGlzLnNwaW5uZXIuc3VjY2VlZCh0ZXh0KTtcbiAgICB9XG4gIH1cblxuICBmYWlsKHRleHQ/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnNwaW5uZXIuZmFpbCh0ZXh0ICYmIGNvbG9ycy5yZWRCcmlnaHQodGV4dCkpO1xuICB9XG5cbiAgc3RvcCgpOiB2b2lkIHtcbiAgICB0aGlzLnNwaW5uZXIuc3RvcCgpO1xuICB9XG5cbiAgc3RhcnQodGV4dD86IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh0aGlzLmVuYWJsZWQpIHtcbiAgICAgIHRoaXMuc3Bpbm5lci5zdGFydCh0ZXh0KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weeks = exports.days = exports.hours = exports.minutes = exports.seconds = void 0;
const seconds = (howMany) => howMany * 1000;
exports.seconds = seconds;
const minutes = (howMany) => 60 * howMany * (0, exports.seconds)(1);
exports.minutes = minutes;
const hours = (howMany) => 60 * howMany * (0, exports.minutes)(1);
exports.hours = hours;
const days = (howMany) => 24 * howMany * (0, exports.hours)(1);
exports.days = days;
const weeks = (howMany) => 7 * howMany * (0, exports.days)(1);
exports.weeks = weeks;
//# sourceMappingURL=utilities.js.map
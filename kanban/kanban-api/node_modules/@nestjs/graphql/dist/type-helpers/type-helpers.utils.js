"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyFieldDecorators = void 0;
const decorators_1 = require("../decorators");
function applyFieldDecorators(targetClass, item) {
    if (item.extensions) {
        (0, decorators_1.Extensions)(item.extensions)(targetClass.prototype, item.name);
    }
    if (item.directives?.length) {
        item.directives.map((directive) => {
            (0, decorators_1.Directive)(directive.sdl)(targetClass.prototype, item.name);
        });
    }
}
exports.applyFieldDecorators = applyFieldDecorators;

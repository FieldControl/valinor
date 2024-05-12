"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainViewComponent = void 0;
var core_1 = require("@angular/core");
var drag_drop_1 = require("@angular/cdk/drag-drop");
var board_model_1 = require("../../models/board.model");
var column_model_1 = require("../../models/column.model");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var MainViewComponent = function () {
    var _classDecorators = [(0, core_1.Component)({
            selector: 'app-main-view',
            standalone: true,
            imports: [drag_drop_1.CdkDrag, drag_drop_1.CdkDropList, common_1.CommonModule, drag_drop_1.CdkDropListGroup, forms_1.FormsModule],
            templateUrl: './main-view.component.html',
            styleUrl: './main-view.component.css'
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var MainViewComponent = _classThis = /** @class */ (function () {
        function MainViewComponent_1() {
            this.AddAndRemove = '';
            this.board = new board_model_1.board('board', [new column_model_1.column('', []),
                new column_model_1.column('', []),
                new column_model_1.column('', []),
                new column_model_1.column('', [])]);
        }
        MainViewComponent_1.prototype.drop = function (event) {
            if (event.previousContainer === event.container) {
                (0, drag_drop_1.moveItemInArray)(event.container.data, event.previousIndex, event.currentIndex);
            }
            else {
                (0, drag_drop_1.transferArrayItem)(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
            }
        };
        MainViewComponent_1.prototype.add = function (AddAndRemove, index) {
            for (var i = 0; i < this.board.columns.length; i++) {
                if (this.board.columns[index] == this.board.columns[i]) {
                    this.board.columns[i].task.push(this.AddAndRemove);
                }
            }
        };
        MainViewComponent_1.prototype.TituloTab = function (AddAndRemove, index) {
            for (var i = 0; i < this.board.columns.length; i++) {
                if (this.board.columns[index] == this.board.columns[i]) {
                    this.board.columns[i].name = this.AddAndRemove;
                }
            }
        };
        MainViewComponent_1.prototype.remove = function (AddAndRemove, index) {
            for (var i = 0; i < this.board.columns.length; i++) {
                if (this.board.columns[index] == this.board.columns[i]) {
                    for (var n = 0; n < this.board.columns[i].task.length; n++) {
                        this.board.columns[i].task.splice(n, 1);
                    }
                }
            }
        };
        return MainViewComponent_1;
    }());
    __setFunctionName(_classThis, "MainViewComponent");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MainViewComponent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MainViewComponent = _classThis;
}();
exports.MainViewComponent = MainViewComponent;

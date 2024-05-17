"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateColunaDto = void 0;
const class_validator_1 = require("class-validator");
class CreateColunaDto {
}
exports.CreateColunaDto = CreateColunaDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Coluna deve ser uma string.' }),
    (0, class_validator_1.Length)(3, 20, { message: 'Coluna deve ter ao menos tres caractere' }),
    __metadata("design:type", String)
], CreateColunaDto.prototype, "title", void 0);
//# sourceMappingURL=create-coluna.dto.js.map
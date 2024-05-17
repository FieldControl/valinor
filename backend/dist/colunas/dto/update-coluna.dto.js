"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateColunaDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_coluna_dto_1 = require("./create-coluna.dto");
class UpdateColunaDto extends (0, mapped_types_1.PartialType)(create_coluna_dto_1.CreateColunaDto) {
}
exports.UpdateColunaDto = UpdateColunaDto;
//# sourceMappingURL=update-coluna.dto.js.map
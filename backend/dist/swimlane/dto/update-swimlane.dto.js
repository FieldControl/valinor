"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSwimlaneDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_swimlane_dto_1 = require("./create-swimlane.dto");
class UpdateSwimlaneDto extends (0, mapped_types_1.PartialType)(create_swimlane_dto_1.CreateSwimlaneDto) {
}
exports.UpdateSwimlaneDto = UpdateSwimlaneDto;
//# sourceMappingURL=update-swimlane.dto.js.map
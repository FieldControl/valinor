"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCardDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_card_dto_1 = require("./create-card.dto");
class UpdateCardDto extends (0, mapped_types_1.PartialType)(create_card_dto_1.CreateCardDto) {
}
exports.UpdateCardDto = UpdateCardDto;
//# sourceMappingURL=update-card.dto.js.map
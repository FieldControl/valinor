"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    type: "sqlite",
    database: ".db/sql.db",
    entities: [__dirname + "/**/*.entity{.ts,.js}"],
    synchronize: true
};
//# sourceMappingURL=orm-config.js.map
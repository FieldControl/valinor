"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectEntityManager = exports.InjectConnection = exports.InjectDataSource = exports.InjectRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_constants_1 = require("../typeorm.constants");
const typeorm_utils_1 = require("./typeorm.utils");
const InjectRepository = (entity, dataSource = typeorm_constants_1.DEFAULT_DATA_SOURCE_NAME) => (0, common_1.Inject)((0, typeorm_utils_1.getRepositoryToken)(entity, dataSource));
exports.InjectRepository = InjectRepository;
const InjectDataSource = (dataSource) => (0, common_1.Inject)((0, typeorm_utils_1.getDataSourceToken)(dataSource));
exports.InjectDataSource = InjectDataSource;
/** @deprecated */
exports.InjectConnection = exports.InjectDataSource;
const InjectEntityManager = (dataSource) => (0, common_1.Inject)((0, typeorm_utils_1.getEntityManagerToken)(dataSource));
exports.InjectEntityManager = InjectEntityManager;

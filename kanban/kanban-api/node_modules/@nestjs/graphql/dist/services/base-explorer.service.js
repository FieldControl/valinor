"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseExplorerService = void 0;
const lodash_1 = require("lodash");
class BaseExplorerService {
    getModules(modulesContainer, include) {
        if (!include || (0, lodash_1.isEmpty)(include)) {
            return [...modulesContainer.values()];
        }
        const explicitlyWhitelisted = this.includeWhitelisted(modulesContainer, include);
        const modulesToInclude = [];
        const toCheck = [...explicitlyWhitelisted];
        while (toCheck.length) {
            const moduleRef = toCheck.pop();
            if (!modulesToInclude.includes(moduleRef)) {
                modulesToInclude.push(moduleRef);
                toCheck.push(...moduleRef.imports);
            }
        }
        return modulesToInclude;
    }
    includeWhitelisted(modulesContainer, include) {
        const modules = [...modulesContainer.values()];
        return modules.filter(({ metatype }) => include.some((item) => item === metatype));
    }
    flatMap(modules, callback) {
        const invokeMap = () => {
            return modules.map((moduleRef) => {
                const providers = [...moduleRef.providers.values()];
                return providers.map((wrapper) => callback(wrapper, moduleRef));
            });
        };
        return (0, lodash_1.flattenDeep)(invokeMap()).filter(lodash_1.identity);
    }
    groupMetadata(resolvers) {
        const groupByType = (0, lodash_1.groupBy)(resolvers, (metadata) => metadata.type);
        const groupedMetadata = (0, lodash_1.mapValues)(groupByType, (resolversArr) => resolversArr.reduce((prev, curr) => ({
            ...prev,
            [curr.name]: curr.callback,
        }), {}));
        return groupedMetadata;
    }
}
exports.BaseExplorerService = BaseExplorerService;

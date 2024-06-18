"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataLoader = void 0;
const plugin_constants_1 = require("./plugin-constants");
class MetadataLoader {
    static addRefreshHook(hook) {
        return MetadataLoader.refreshHooks.unshift(hook);
    }
    async load(metadata) {
        const pkgMetadata = metadata['@nestjs/graphql'];
        if (!pkgMetadata) {
            return;
        }
        const { models } = pkgMetadata;
        if (models) {
            await this.applyMetadata(models);
        }
        this.runHooks();
    }
    runHooks() {
        MetadataLoader.refreshHooks.forEach((hook) => hook());
    }
    async applyMetadata(meta) {
        const loadPromises = meta.map(async ([fileImport, fileMeta]) => {
            const fileRef = await fileImport;
            Object.keys(fileMeta).map((key) => {
                const clsRef = fileRef[key];
                clsRef[plugin_constants_1.METADATA_FACTORY_NAME] = () => fileMeta[key];
            });
        });
        await Promise.all(loadPromises);
    }
}
exports.MetadataLoader = MetadataLoader;
MetadataLoader.refreshHooks = new Array();

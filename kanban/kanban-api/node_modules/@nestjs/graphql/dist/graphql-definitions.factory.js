"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLDefinitionsFactory = void 0;
const schema_1 = require("@graphql-tools/schema");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const chokidar = require("chokidar");
const graphql_1 = require("graphql");
const graphql_tag_1 = require("graphql-tag");
const graphql_ast_explorer_1 = require("./graphql-ast.explorer");
const graphql_types_loader_1 = require("./graphql-types.loader");
const utils_1 = require("./utils");
class GraphQLDefinitionsFactory {
    constructor() {
        this.gqlAstExplorer = new graphql_ast_explorer_1.GraphQLAstExplorer();
        this.gqlTypesLoader = new graphql_types_loader_1.GraphQLTypesLoader();
    }
    async generate(options) {
        const isDebugEnabled = !(options && options.debug === false);
        const typePathsExists = options.typePaths && !(0, shared_utils_1.isEmpty)(options.typePaths);
        if (!typePathsExists) {
            throw new Error(`"typePaths" property cannot be empty.`);
        }
        const definitionsGeneratorOptions = {
            emitTypenameField: options.emitTypenameField,
            skipResolverArgs: options.skipResolverArgs,
            defaultScalarType: options.defaultScalarType,
            customScalarTypeMapping: options.customScalarTypeMapping,
            additionalHeader: options.additionalHeader,
            defaultTypeMapping: options.defaultTypeMapping,
            enumsAsTypes: options.enumsAsTypes,
        };
        if (options.watch) {
            this.printMessage('GraphQL factory is watching your files...', isDebugEnabled);
            const watcher = chokidar.watch(options.typePaths);
            watcher.on('change', async (file) => {
                this.printMessage(`[${new Date().toLocaleTimeString()}] "${file}" has been changed.`, isDebugEnabled);
                await this.exploreAndEmit(options.typePaths, options.path, options.outputAs, isDebugEnabled, definitionsGeneratorOptions, options.typeDefs);
            });
        }
        await this.exploreAndEmit(options.typePaths, options.path, options.outputAs, isDebugEnabled, definitionsGeneratorOptions, options.typeDefs);
    }
    async exploreAndEmit(typePaths, path, outputAs, isDebugEnabled, definitionsGeneratorOptions, typeDefs) {
        const typePathDefs = await this.gqlTypesLoader.mergeTypesByPaths(typePaths || []);
        const mergedTypeDefs = (0, utils_1.extend)(typePathDefs, typeDefs);
        if (!mergedTypeDefs) {
            throw new Error(`"typeDefs" property cannot be null.`);
        }
        let schema = (0, schema_1.makeExecutableSchema)({
            typeDefs: mergedTypeDefs,
            resolverValidationOptions: { requireResolversToMatchSchema: 'ignore' },
        });
        schema = (0, utils_1.removeTempField)(schema);
        const tsFile = await this.gqlAstExplorer.explore((0, graphql_tag_1.gql) `
        ${(0, graphql_1.printSchema)(schema)}
      `, path, outputAs, definitionsGeneratorOptions);
        await tsFile.save();
        this.printMessage(`[${new Date().toLocaleTimeString()}] The definitions have been updated.`, isDebugEnabled);
    }
    printMessage(text, isEnabled) {
        isEnabled && console.log(text);
    }
}
exports.GraphQLDefinitionsFactory = GraphQLDefinitionsFactory;

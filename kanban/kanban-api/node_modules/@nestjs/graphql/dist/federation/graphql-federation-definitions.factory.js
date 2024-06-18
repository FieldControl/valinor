"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLFederationDefinitionsFactory = void 0;
const load_package_util_1 = require("@nestjs/common/utils/load-package.util");
const graphql_tag_1 = require("graphql-tag");
const graphql_definitions_factory_1 = require("../graphql-definitions.factory");
const utils_1 = require("../utils");
const merge_1 = require("@graphql-tools/merge");
class GraphQLFederationDefinitionsFactory extends graphql_definitions_factory_1.GraphQLDefinitionsFactory {
    async exploreAndEmit(typePaths, path, outputAs, isDebugEnabled, definitionsGeneratorOptions, typeDefs) {
        const typePathDefs = await this.gqlTypesLoader.mergeTypesByPaths(typePaths);
        const mergedTypeDefs = (0, utils_1.extend)(typePathDefs, typeDefs);
        const { buildSubgraphSchema } = (0, load_package_util_1.loadPackage)('@apollo/subgraph', 'ApolloFederation', () => require('@apollo/subgraph'));
        const { printSubgraphSchema } = (0, load_package_util_1.loadPackage)('@apollo/subgraph', 'ApolloFederation', () => require('@apollo/subgraph'));
        const schema = buildSubgraphSchema([
            {
                typeDefs: (0, graphql_tag_1.gql) `
          ${mergedTypeDefs}
        `,
                resolvers: {},
            },
        ]);
        // "buildSubgraphSchema" generates an empty Query definition if there is the `extend type Query` statement
        // This leads to duplicated IQuery interfaces
        // see: https://github.com//issues/2344
        const mergedDefinition = (0, merge_1.mergeTypeDefs)([printSubgraphSchema(schema)], {
            useSchemaDefinition: false,
            throwOnConflict: true,
            commentDescriptions: true,
            reverseDirectives: true,
        });
        const tsFile = await this.gqlAstExplorer.explore((0, graphql_tag_1.gql) `
        ${mergedDefinition}
      `, path, outputAs, definitionsGeneratorOptions);
        await tsFile.save();
        this.printMessage(`[${new Date().toLocaleTimeString()}] The definitions have been updated.`, isDebugEnabled);
    }
}
exports.GraphQLFederationDefinitionsFactory = GraphQLFederationDefinitionsFactory;

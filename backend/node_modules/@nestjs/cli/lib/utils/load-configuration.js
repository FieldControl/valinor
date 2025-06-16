"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfiguration = loadConfiguration;
const nest_configuration_loader_1 = require("../configuration/nest-configuration.loader");
const readers_1 = require("../readers");
async function loadConfiguration() {
    const loader = new nest_configuration_loader_1.NestConfigurationLoader(new readers_1.FileSystemReader(process.cwd()));
    return loader.load();
}

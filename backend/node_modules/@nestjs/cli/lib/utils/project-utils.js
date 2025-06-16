"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldAskForProject = shouldAskForProject;
exports.shouldGenerateSpec = shouldGenerateSpec;
exports.shouldGenerateFlat = shouldGenerateFlat;
exports.getSpecFileSuffix = getSpecFileSuffix;
exports.askForProjectName = askForProjectName;
exports.moveDefaultProjectToStart = moveDefaultProjectToStart;
exports.hasValidOptionFlag = hasValidOptionFlag;
const inquirer = require("inquirer");
const get_value_or_default_1 = require("../compiler/helpers/get-value-or-default");
const questions_1 = require("../questions/questions");
function shouldAskForProject(schematic, configurationProjects, appName) {
    return (['app', 'sub-app', 'library', 'lib'].includes(schematic) === false &&
        configurationProjects &&
        Object.entries(configurationProjects).length !== 0 &&
        !appName);
}
function shouldGenerateSpec(configuration, schematic, appName, specValue, specPassedAsInput) {
    if (specPassedAsInput === true || specPassedAsInput === undefined) {
        // CLI parameters has the highest priority
        return specValue;
    }
    let specConfiguration = (0, get_value_or_default_1.getValueOrDefault)(configuration, 'generateOptions.spec', appName || '');
    if (typeof specConfiguration === 'boolean') {
        return specConfiguration;
    }
    if (typeof specConfiguration === 'object' &&
        specConfiguration[schematic] !== undefined) {
        return specConfiguration[schematic];
    }
    if (typeof specConfiguration === 'object' && appName) {
        // The appName has a generateOption spec, but not for the schematic trying to generate
        // Check if the global generateOptions has a spec to use instead
        specConfiguration = (0, get_value_or_default_1.getValueOrDefault)(configuration, 'generateOptions.spec', '');
        if (typeof specConfiguration === 'boolean') {
            return specConfiguration;
        }
        if (typeof specConfiguration === 'object' &&
            specConfiguration[schematic] !== undefined) {
            return specConfiguration[schematic];
        }
    }
    return specValue;
}
function shouldGenerateFlat(configuration, appName, flatValue) {
    // CLI parameters have the highest priority
    if (flatValue === true) {
        return flatValue;
    }
    const flatConfiguration = (0, get_value_or_default_1.getValueOrDefault)(configuration, 'generateOptions.flat', appName || '');
    if (typeof flatConfiguration === 'boolean') {
        return flatConfiguration;
    }
    return flatValue;
}
function getSpecFileSuffix(configuration, appName, specFileSuffixValue) {
    // CLI parameters have the highest priority
    if (specFileSuffixValue) {
        return specFileSuffixValue;
    }
    const specFileSuffixConfiguration = (0, get_value_or_default_1.getValueOrDefault)(configuration, 'generateOptions.specFileSuffix', appName || '', undefined, undefined, 'spec');
    if (typeof specFileSuffixConfiguration === 'string') {
        return specFileSuffixConfiguration;
    }
    return specFileSuffixValue;
}
async function askForProjectName(promptQuestion, projects) {
    const questions = [
        (0, questions_1.generateSelect)('appName')(promptQuestion)(projects),
    ];
    const prompt = inquirer.createPromptModule();
    return prompt(questions);
}
function moveDefaultProjectToStart(configuration, defaultProjectName, defaultLabel) {
    let projects = configuration.projects != null ? Object.keys(configuration.projects) : [];
    if (configuration.sourceRoot !== 'src') {
        projects = projects.filter((p) => p !== defaultProjectName.replace(defaultLabel, ''));
    }
    projects.unshift(defaultProjectName);
    return projects;
}
function hasValidOptionFlag(queriedOptionName, options, queriedValue = true) {
    return options.some((option) => option.name === queriedOptionName && option.value === queriedValue);
}

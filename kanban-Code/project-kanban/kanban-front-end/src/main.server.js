"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var platform_browser_1 = require("@angular/platform-browser");
var app_component_1 = require("./app/app.component");
var app_config_server_1 = require("./app/app.config.server");
var bootstrap = function () { return (0, platform_browser_1.bootstrapApplication)(app_component_1.AppComponent, app_config_server_1.config); };
exports.default = bootstrap;

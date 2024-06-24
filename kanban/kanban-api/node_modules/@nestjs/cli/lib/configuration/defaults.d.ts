import { Configuration } from './configuration';
export declare const defaultConfiguration: Required<Configuration>;
export declare const defaultTsconfigFilename: string;
export declare const defaultWebpackConfigFilename = "webpack.config.js";
export declare const defaultOutDir = "dist";
export declare const defaultGitIgnore = "# compiled output\n/dist\n/node_modules\n/build\n\n# Logs\nlogs\n*.log\nnpm-debug.log*\npnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\nlerna-debug.log*\n\n# OS\n.DS_Store\n\n# Tests\n/coverage\n/.nyc_output\n\n# IDEs and editors\n/.idea\n.project\n.classpath\n.c9/\n*.launch\n.settings/\n*.sublime-workspace\n\n# IDE - VSCode\n.vscode/*\n!.vscode/settings.json\n!.vscode/tasks.json\n!.vscode/launch.json\n!.vscode/extensions.json\n\n# dotenv environment variable files\n.env\n.env.development.local\n.env.test.local\n.env.production.local\n.env.local\n\n# temp directory\n.temp\n.tmp\n\n# Runtime data\npids\n*.pid\n*.seed\n*.pid.lock\n\n# Diagnostic reports (https://nodejs.org/api/report.html)\nreport.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json\n";

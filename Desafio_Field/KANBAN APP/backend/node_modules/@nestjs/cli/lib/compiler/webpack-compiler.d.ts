import { Configuration } from '../configuration';
import { AssetsManager } from './assets-manager';
import { PluginsLoader } from './plugins-loader';
import { Input } from '../../commands';
import webpack = require('webpack');
type WebpackConfigFactory = (config: webpack.Configuration, webpackRef: typeof webpack) => webpack.Configuration;
type WebpackConfigFactoryOrConfig = WebpackConfigFactory | webpack.Configuration;
export declare class WebpackCompiler {
    private readonly pluginsLoader;
    constructor(pluginsLoader: PluginsLoader);
    run(configuration: Required<Configuration>, options: Input[], webpackConfigFactoryOrConfig: WebpackConfigFactoryOrConfig | WebpackConfigFactoryOrConfig[], tsConfigPath: string, appName: string, isDebugEnabled: boolean | undefined, watchMode: boolean | undefined, assetsManager: AssetsManager, onSuccess?: () => void): void;
}
export {};

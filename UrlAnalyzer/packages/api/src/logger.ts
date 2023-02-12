import { inspect } from 'node:util';
import kleur from 'kleur';

kleur.enabled = true;

inspect.defaultOptions.depth = 10;
inspect.defaultOptions.maxArrayLength = Number.POSITIVE_INFINITY;

interface ILogger {
	debug(message: string, ...args: any[]): void;
	debugEnabled: boolean;
	error(message: string, ...args: any[]): void;
	info(message: string, ...args: any[]): void;
	infoEnabled: boolean;
	success(message: string, ...args: any[]): void;
	warn(message: string, ...args: any[]): void;
}

const logger: ILogger = {
	debugEnabled: true,
	infoEnabled: true,
	success(message: string, ...args: any[]) {
		console.log(`${kleur.green(`[Success]:`)} ${message}`, ...args);
	},
	info(message: string, ...args: any[]) {
		if (!this.infoEnabled) return;
		console.log(`${kleur.blue('[Info]:')} ${message}`, ...args);
	},
	debug(message: string, ...args: any[]) {
		if (!this.debugEnabled) return;
		console.log(`${kleur.gray('[Debug]:')} ${message}`, ...args);
	},
	warn(message: string, ...args: any[]) {
		console.log(`${kleur.yellow('[Warn]:')} ${message}`, ...args);
	},
	error(message: string, ...args: any[]) {
		console.log(`${kleur.red('[Error]:')} ${message}`, ...args);
	},
};

export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const success = logger.success.bind(logger);
export const warn = logger.warn.bind(logger);

export default logger;

import type { HTTPRequest } from 'puppeteer';

export const URL_SCAN_EPOCH = new Date().setFullYear(2_003, 10, 20);

export const REGEXES = {
	EMAIL: /^[\w.-]+@[\d.A-Za-z-]+\.[A-Za-z]{2,4}$/,
	USERNAME: /^[\w.-]{3,32}$/,
	PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()-_{|}])[\d!"#$%&'()-_a-z{|}]{8,32}$/,
	TELEPHONE: /^(?<number>\d{10,11})$/,
	// IDs are snowflakes, ex: 17753379918470713344
	ID: /^\d{19,21}$/,
	// eslint-disable-next-line unicorn/no-unsafe-regex
	TIME: /^(?:\d{1,2}:){2}\d{1,2}$/,
	POSTAL_CODE: /^\d{5}-?\d{3}$/,
	// eslint-disable-next-line unicorn/no-unsafe-regex
	RG: /\d{2}(?:\.?\d{3}){2}-?\d/,
	// eslint-disable-next-line unicorn/no-unsafe-regex
	CPF: /\d{3}(?:\.?\d{3}){2}[/-]?\d/,
	URL: /https?:\/\/(?:www\.)?[\w#%+.:=@~-]{1,256}\.[\d()A-Za-z]{1,6}\b[\w#%&()+./:=?@~-]*/g,
} as const;

export const CEP_API_BASE_URL = 'https://cdn.apicep.com/file/apicep/' as const;

export const MAX_BODY_SIZE = 100_000 as const;

export const TOKEN_EXPIRATION_MS = 43_200_000;

export const STATE_EXPIRATION_SECONDS = 60 * 30;

export const OP_DELIMITER = '-' as const;

export const RATE_LIMITS = {
	USER: {
		PER_ENDPOINT: 100,
		GLOBAL: 250,
	},
	UNALTHENTICATED_USER: {
		PER_ENDPOINT: 10,
		GLOBAL: 20,
	},
	IP: {
		PER_ENDPOINT: 250,
		GLOBAL: 500,
	},
} as const;

export const SERVICES_CONSTANTS = {
	SAFE_BROWSING: {
		SAFE_BROWSING: 'https://safebrowsing.googleapis.com/v4',
		TRANSPARENCY_REPORT: 'https://transparencyreport.google.com/transparencyreport/api/v3/safebrowsing/status',
		EXPIRE_SECONDS: 60 * 60,
	},
};

export enum TableWorkerIdentifiers {
	Users,
	Sessions,
	OAuthConnections,
	ScanNonce,
	Scan,
	Certificates,
	Request,
	Response,
}

export enum Providers {
	Discord = 'discord',
	GitHub = 'github',
	Google = 'google',
	Microsoft = 'microsoft',
}

export const allowedResourceTypes: ReturnType<HTTPRequest['resourceType']>[] = [
	'document',
	'stylesheet',
	'script',
	'xhr',
	'fetch',
];

export const ImgurRateLimitTime = 86_400;

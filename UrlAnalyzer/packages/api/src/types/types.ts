import type { ConsoleMessageType, JSHandle, Protocol } from 'puppeteer';
import type { BaseProps, PopulatedRequest, RawCertificate } from './database.js';
import type {
	PlatformType,
	ThreadEntryType,
	ThreadType,
	TransparencyReportFlags,
	TransparencyReportGenericStatus,
} from './enums.js';

export interface SafeBrowsingResponse {
	matches: ThreatMatch[];
}

/**
 * A match when checking a threat entry in the Safe Browsing threat lists.
 */
export interface ThreatMatch {
	/**
	 * The cache lifetime for the returned match. Clients must not cache this response for more than this duration to avoid false positives.
	 */
	cacheDuration?: string | null;
	/**
	 * The platform type matching this threat.
	 */
	platformType?: PlatformType;
	/**
	 * The threat matching this threat.
	 */
	threat?: ThreatEntry;
	/**
	 * Optional metadata associated with this threat.
	 */
	threatEntryMetadata?: ThreatEntryMetadata[];
	/**
	 * The threat entry type matching this threat.
	 */
	threatEntryType?: ThreadEntryType;
	/**
	 * The threat type matching this threat.
	 */
	threatType?: ThreadType;
}

export interface ThreatEntry {
	/**
	 * The digest of an executable in SHA256 format. The API supports both binary and hex digests. For JSON requests, digests are base64-encoded.
	 */
	digest?: string | null;
	/**
	 * A hash prefix, consisting of the most significant 4-32 bytes of a SHA256 hash. This field is in binary format. For JSON requests, hashes are base64-encoded.
	 */
	hash?: string | null;
	/**
	 * A URL.
	 */
	url?: string | null;
}

export interface ThreatEntryMetadata {
	/**
	 * The metadata entry key. For JSON requests, the key is base64-encoded.
	 */
	key?: string | null;
	/**
	 * The metadata entry value. For JSON requests, the value is base64-encoded.
	 */
	value?: string | null;
}

export type TransparencyReportResponse = [
	string,
	TransparencyReportGenericStatus,
	NumberBoolean,
	NumberBoolean,
	NumberBoolean,
	NumberBoolean,
	NumberBoolean,
	number,
	string,
];

export type NumberBoolean = 0 | 1;

export interface SafeBrowsing {
	platformType: PlatformType;
	threatEntryType: ThreadEntryType;
	threatType: ThreadType;
	url: string;
}

export interface TransparencyReport {
	flags: TransparencyReportFlags[];
	lastTimeChecked: number;
	status: TransparencyReportGenericStatus;
	url: string;
}

export interface RequestResult {
	headers: Record<string, string>;
	initiator: Protocol.Network.Initiator;
	method: string;
	nonce?: string;
	post_data: string | undefined;
	redirect_chain: RequestResult[];
	resource_type: string;
	response: ResponseResult | null;
	url: string;
}

export interface ResponseResult {
	body: string | null;
	headers: Record<string, string>;
	status: number;
	url: string;
}

export interface ConsoleOutput {
	args: JSHandle<unknown>[];
	text: string;
	type: ConsoleMessageType;
}

export interface Screenshot {
	id: string | null;
	url: string;
}

export interface UrlSecurityDetails {
	safeBrowsing: SafeBrowsing[];
	transparencyReport: TransparencyReport | null;
}

export interface Certificate extends BaseProps {
	certificates: {
		decoded: string;
		encoded: string;
		x509: {
			ca: boolean;
			fingerprint: string;
			fingerprint256: string;
			fingerprint512: string;
			infoAccess: Record<string, string>;
			issuer: Record<string, string>;
			keyUsage: string[];
			serialNumber: string;
			subject: Record<string, string>;
			subjectAltName: string[];
			validFrom: string;
			validTo: string;
		};
	}[];
	id: string;
	issuer: string;
	protocol: string;
	subjectName: string;
	validFrom: number;
	validTo: number;
}

export interface UrlAnalysisResult extends BaseProps {
	authorId: string | null;
	body: string;
	certificate: RawCertificate;
	certificate_id: string;
	consoleOutput: ConsoleOutput[];
	contactedDomains: string[];
	cookies: Protocol.Network.Cookie[];
	dns: Record<string, string[]>;
	effectiveUrl: string;
	lighthouseAnalysis: LightHouseReport;
	metadata: Record<string, unknown>;
	requests: PopulatedRequest[];
	requests_ids: string[];
	screenshot: Screenshot | null;
	securityDetails: UrlSecurityDetails;
	url: string;
	urlsFound: string[];
}

type LightHouseAudits = Record<
	string,
	{
		extra: {
			fix: string | null;
			impact: 'critical' | 'minor' | 'moderate' | 'serious' | null;
			type: 'incomplete' | 'notApplicable' | 'passes' | 'violations';
		} | null;
		group: string | null;
		id: string;
		score: number | null;
	}
>;

export interface LightHouseReport {
	audits: {
		accessibility: LightHouseAudits;
		'best-practices': LightHouseAudits;
		performance: LightHouseAudits;
		pwa: LightHouseAudits;
		seo: LightHouseAudits;
	};
	scores: {
		accessibility: number | null;
		'best-practices': number | null;
		performance: number | null;
		pwa: number | null;
		seo: number | null;
	};
}

export type InternalCache = Map<
	string,
	{
		added: number;
		data?: UrlAnalysisResult;
		error?: string;
		ok: boolean;
	}
>;

/* eslint-disable typescript-sort-keys/interface */
import type { Protocol } from 'puppeteer';
import type { ConsoleOutput, LightHouseReport, RequestResult, Screenshot, UrlSecurityDetails } from './types.js';
import type { OmitBaseProps, OmitBasePropsAndMore } from './utils.js';

export interface BaseProps {
	id: string;
	created_at: string;
	updated_at: string;
}

export interface RawUser extends BaseProps {
	email: string;
	password: string | null;
	type: number;
	name: string;
	active: boolean;
	known_ips_hashes: string[];
	two_factor_config_id: string | null;
	last_login_at: string | null;
	reset_password_token: string | null;
	terms_accepted_at: string | null;
}

export type SafeUser = Omit<RawUser, 'known_ips_hashes' | 'password' | 'reset_password_token'>;

export type ModifiableUser = OmitBasePropsAndMore<
	RawUser,
	'last_login_at' | 'reset_password_token' | 'terms_accepted_at' | 'two_factor_config_id'
>;

export type InternalModifiableUser = OmitBaseProps<RawUser>;

export interface RawOauthConnection extends BaseProps {
	user_id: string;
	provider: string;
	provider_user_id: string;
	access_token: string;
	refresh_token: string;
	scopes: string[];
	expires_at: Date | string;
}

export type ModifiableOauthConnection = OmitBasePropsAndMore<RawOauthConnection, 'user_id'>;

export type InternalModifiableOauthConnection = OmitBasePropsAndMore<RawOauthConnection, 'expires_at'> & {
	expires_at: Date | string;
};

export interface RawTwoFactorConfig extends BaseProps {
	enabled: boolean;
	type: number;
	secret: string | null;
	recovery_codes: string[];
}

export type ModifiableTwoFactorConfig = OmitBaseProps<RawTwoFactorConfig>;

export interface RawSession extends BaseProps {
	user_id: string;
	session_token: string;
}

export type ModifiableSession = never;

export type SafeSession = Omit<RawSession, 'session_token'> & { token: string };

export interface RawUrlAnalysis extends BaseProps {
	author_id: string | null;
	url: string;
	contacted_domains: string[];
	dns: Record<string, string[]>;
	metadata: Record<string, unknown>;
	screenshot: Screenshot | null;
	body: string;
	effective_url: string;
	security_details: UrlSecurityDetails;
	urls_found: string[];
	cookies: Protocol.Network.Cookie[];
	console_output: ConsoleOutput[];
	requests_ids: string[];
	certificate_id: string;
	lighthouse_analysis: LightHouseReport | null;
}

export interface RawCertificate extends BaseProps {
	parent_id: string;
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
	issuer: string;
	protocol: string;
	subject_name: string;
	valid_from: number;
	valid_to: number;
}

export interface RawRequest extends BaseProps {
	parent_id: string;
	headers: Record<string, string>;
	initiator: Protocol.Network.Initiator;
	method: string;
	nonce: string | null | undefined;
	post_data: string | null | undefined;
	redirect_chain: RequestResult[];
	resource_type: string;
	response_id: string;
	url: string;
}

export interface PopulatedRequest extends RawRequest {
	response: RawResponse | null;
}

export interface RawResponse extends BaseProps {
	parent_id: string;
	body: string | null;
	headers: Record<string, string>;
	status: number;
	url: string;
}

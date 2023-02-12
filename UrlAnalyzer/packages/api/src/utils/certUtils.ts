export function convertCert(derCert: string) {
	let pemCert = '-----BEGIN CERTIFICATE-----\n';

	for (let idx = 0; idx < derCert.length; idx += 64) {
		pemCert += derCert.slice(idx, idx + 64) + '\n';
	}

	pemCert += '-----END CERTIFICATE-----';
	return pemCert;
}

export function parseSubject(subject: string | undefined) {
	if (!subject) return {};

	const parsedSubject: Record<string, string> = {};

	const split = subject.split('\n');

	for (const item of split) {
		const [key, value] = item.split('=') as [string, string];

		parsedSubject[key] = value.replace('\\\\', '');
	}

	return parsedSubject;
}

export function parseSubjectAltName(subjectAltName: string | undefined) {
	if (!subjectAltName) return [];

	return subjectAltName.split(', ').map((item) => item.split(':')[1]!);
}

export function parseIssuer(issuer: string | undefined) {
	if (!issuer) return {};

	const parsedIssuer: Record<string, string> = {};

	const split = issuer.split('\n');

	for (const item of split) {
		const [key, value] = item.split('=') as [string, string];

		parsedIssuer[key] = value.replace('\\\\', '\\');
	}

	return parsedIssuer;
}

export function parseInfoAccess(infoAccess: string | undefined) {
	if (!infoAccess) return {};

	const split = infoAccess.split('\n').map((item) => item.split(' - URI:')) as [string, string][];

	const parsedInfoAccess: Record<string, string> = {};

	for (const item of split) {
		parsedInfoAccess[item[0]] = item[1];
	}

	return parsedInfoAccess;
}

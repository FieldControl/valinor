import type { RawCertificate } from '@types';
import type { Sql } from 'postgres';
import { kSQL } from 'tokens.js';
import { container } from 'tsyringe';

export async function getCertificateDetails(certificate_id: string): Promise<RawCertificate> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [result] = await sql<[RawCertificate]>`
		select * from certificate_details where id = ${certificate_id}
	`;

	return result;
}

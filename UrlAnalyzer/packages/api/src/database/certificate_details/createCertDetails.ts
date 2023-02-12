import type { RawCertificate } from '@types';
import { generateSnowflake } from '@utils/idUtils.js';
import { OP_DELIMITER, TableWorkerIdentifiers } from 'constants.js';
import type { Sql } from 'postgres';
import { kSQL } from 'tokens.js';
import { container } from 'tsyringe';

export async function createCertificateDetails(
	data: Omit<RawCertificate, 'created_at' | 'updated_at'>,
): Promise<RawCertificate> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const query: Omit<RawCertificate, 'created_at' | 'updated_at'> = {
		id: `${data.id}${OP_DELIMITER}${generateSnowflake(TableWorkerIdentifiers.Certificates)}`,
		parent_id: data.parent_id,
		certificates: data.certificates,
		issuer: data.issuer,
		protocol: data.protocol,
		subject_name: data.subject_name,
		valid_from: data.valid_from,
		valid_to: data.valid_to,
	};

	const [result] = await sql<[RawCertificate]>`
		insert into certificate_details ${sql(query as Record<string, unknown>, ...Object.keys(query))}
		returning *
	`;

	return result;
}

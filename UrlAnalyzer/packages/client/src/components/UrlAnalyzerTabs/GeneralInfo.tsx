import type { POSTScanResultEndpointReturn } from '@app/types';
import { TransparencyReportGenericStatus, TransparencyReportFlags } from '@app/types/enums';
import type { UrlAnalysisResult } from '@app/types/types';
import { generateRandomHash } from '@app/utils/generateRandom';
import { makeApiRequest } from '@app/utils/makeApiReq';
import { capitalizeFirstLetter } from '@app/utils/string';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FcHighPriority, FcOk } from 'react-icons/fc';
import favicon from '../../../public/favicon.ico';
import { Pagination } from '../Pagination';

const onScanClick = async (router: AppRouterInstance, url: string) => {
	const res = await makeApiRequest<POSTScanResultEndpointReturn>('/scan/create', {
		method: 'POST',
		body: JSON.stringify({ url }),
	});

	router.push(`/scan/${res.data!.id}`);
};

export function GeneralInfo({ result, router }: { result: UrlAnalysisResult; router: AppRouterInstance }) {
	const dateFormat = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	const [items, setItems] = useState<string[]>(result.urlsFound);

	const { url, effectiveUrl, certificate, screenshot, securityDetails } = result;

	const safeBrowsingIssue = Boolean(securityDetails.safeBrowsing.length);
	const transparencyReportIssue = [2, 3, 5].includes(securityDetails.transparencyReport!.status!);

	const metadata = Object.entries(result.metadata) as [string, string][];

	return (
		<div className="mb-10 mx-10 p-5 flex justify-between rounded-md bg-white items-start gap-7">
			<div className="text-black text-xl w-1/4">
				<div className="bg-gray-300 rounded-md p-4 flex flex-col gap-4">
					<div className="text-white bg-gray-500 p-2 rounded font-sans font-bold text-left text-2xl">General Info:</div>
					<div>
						<span className="text-2xl font-bold text-gray-600">Url: </span> {url}
					</div>
					<div>
						<span className="text-2xl font-bold text-gray-600">Effective Url: </span> {effectiveUrl}
					</div>
				</div>
				<div className="bg-gray-300 rounded-md p-4 mt-4">
					<div className="text-white bg-gray-500 p-2 rounded font-sans font-bold text-left text-2xl">
						Security Verification:
					</div>
					<div className="flex flex-col gap-4">
						<div className="mt-5 inline-flex gap-2">
							<span className="text-2xl font-bold text-gray-600">Safe Browsing:</span>
							{safeBrowsingIssue ? (
								<FcHighPriority className="my-auto" size={28} />
							) : (
								<FcOk className="my-auto" size={28} />
							)}
						</div>
						<details>
							<summary>Details</summary>
							{safeBrowsingIssue
								? securityDetails.safeBrowsing.slice(0, 1).map((sb) => (
										<ul className="list-disc list-inside" key={generateRandomHash()}>
											<li>
												<span className="font-bold">Platform Type:</span> {sb.platformType}
											</li>
											<li>
												<span className="font-bold">Threat Type:</span> {sb.threatType}
											</li>
											<li>
												<span className="font-bold">Threat Entry Type:</span> {sb.threatEntryType}
											</li>
											<li>
												<span className="font-bold">Url:</span> {sb.url}
											</li>
										</ul>
								  ))
								: 'No issues found'}
						</details>
						<div className="inline-flex gap-2">
							<span className="text-2xl font-bold text-gray-600">Transparency Report:</span>
							{transparencyReportIssue ? (
								<FcHighPriority className="my-auto" size={28} />
							) : (
								<FcOk className="my-auto" size={28} />
							)}
						</div>
						<details>
							<summary>Details</summary>
							{securityDetails.transparencyReport ? (
								<ul className="list-disc list-inside" key={generateRandomHash()}>
									<li>
										<span className="font-bold">Status:</span>{' '}
										{TransparencyReportGenericStatus[securityDetails.transparencyReport.status]}
									</li>
									<li>
										<span className="font-bold">Flags:</span>
										{securityDetails.transparencyReport.flags.length ? (
											<ul>
												{securityDetails.transparencyReport.flags.map((flag) => (
													<li key={generateRandomHash()}>{TransparencyReportFlags[flag]}</li>
												))}
											</ul>
										) : (
											' No flags provided'
										)}
									</li>
									<li>
										<span className="font-bold">Last Checked:</span>{' '}
										{dateFormat.format(securityDetails.transparencyReport.lastTimeChecked)}
									</li>
									<li>
										<span className="font-bold">Url:</span> {securityDetails.transparencyReport.url}
									</li>
								</ul>
							) : (
								'No issues found'
							)}
						</details>
					</div>
				</div>
				<div className="mt-4">
					<div className="bg-gray-300 rounded-md p-4">
						<div className="text-white bg-gray-500 p-2 rounded font-sans font-bold text-left text-2xl">
							SSL Certificate:
						</div>
						<div className="mt-3 flex flex-col gap-4">
							<div>
								<span className="text-xl font-bold text-gray-600">Subject Name: </span> {certificate.subject_name}
							</div>
							<div>
								<span className="text-xl font-bold text-gray-600">Issuer Name: </span> {certificate.issuer}
							</div>
							<div>
								<span className="text-xl font-bold text-gray-600">Valid From: </span>
								{dateFormat.format(certificate.valid_from * 1_000)}
							</div>
							<div>
								<span className="text-xl font-bold text-gray-600">Valid To: </span>{' '}
								{dateFormat.format(certificate.valid_to * 1_000)}
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="flex flex-col w-1/2 gap-3">
				<div className="bg-gray-300 rounded-md p-4 ">
					<div className="text-white bg-gray-500 p-2 rounded font-sans font-bold text-left text-2xl">
						Urls found: <div className="text-gray-200 text-sm">Do not click any urls that you don't trust!</div>
					</div>
					<div className="mt-3 flex flex-col gap-4">
						{items.length ? (
							items.map((url: string, idx: number) => (
								<div
									className={`flex justify-between items-center rounded p-2 ${
										idx % 2 === 0 ? 'bg-gray-400' : 'bg-gray-100'
									}`}
									key={generateRandomHash()}
								>
									<div>
										<span className="text-xl font-bold text-gray-600 mr-2">{idx + 1} | Url: </span>{' '}
										<span className="break-all">{url}</span>
									</div>
									<div
										className="bg-gray-500 rounded-md py-1 px-2 ml-4 text-white cursor-pointer"
										onClick={async () => onScanClick(router, url)}
									>
										Scan
									</div>
								</div>
							))
						) : (
							<div className="text-xl font-bold text-gray-600">No urls found</div>
						)}
						{items.length ? <Pagination items={result.urlsFound} itemsPerPage={5} setItems={setItems} /> : null}
					</div>
				</div>
				<div className="flex flex-col bg-gray-300 rounded-md p-4 gap-4">
					<div className="text-white bg-gray-500 p-2 rounded font-sans font-bold text-left text-2xl">Metadata:</div>
					<div className="grid grid-cols-2 gap-2">
						{metadata.map(([key, value]): JSX.Element => {
							return (
								<div className="flex flex-col break-words" key={generateRandomHash()}>
									<div className="text-xl font-bold text-white bg-gray-700 p-1 rounded">
										{capitalizeFirstLetter(key)}:
									</div>
									<div className="text-gray-600 text-xl">{value}</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
			<div className="text-black text-xl w-[800px]">
				<div className="bg-gray-300 rounded-md p-4 gap-3 flex flex-col">
					<div className="flex justify-between items-center text-white bg-gray-500 p-2 rounded font-sans font-bold text-left text-2xl">
						Screenshot:
						<Link
							className="text-white bg-gray-800 p-2 rounded font-sans font-bold text-left text-2xl"
							href={screenshot?.url ?? ''}
							target="_blank"
						>
							See Full
						</Link>
					</div>
					<Image
						alt="Screenshot"
						className="rounded"
						height={90 * 5}
						src={screenshot?.url ?? favicon}
						width={160 * 5}
					/>
				</div>
			</div>
		</div>
	);
}

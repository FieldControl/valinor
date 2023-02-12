import type { LightHouseReport } from '@app/types/types';
import { findAudit } from '@app/utils/findMetric';
import { FcElectricalSensor, FcHighPriority, FcLowPriority, FcMediumPriority } from 'react-icons/fc';
import { SmallScoreCircle } from './ScoreCircle';

function formatExtraType(type: 'incomplete' | 'notApplicable' | 'passes' | 'violations') {
	switch (type) {
		case 'incomplete':
			return 'Incomplete';
		case 'notApplicable':
			return 'Not Applicable';
		case 'passes':
			return 'Passes';
		case 'violations':
			return 'Violations';
	}
}

function FormatImpact({ impact }: { impact?: 'critical' | 'minor' | 'moderate' | 'serious' | null }) {
	switch (impact) {
		case 'minor':
			return (
				<div className="flex items-center gap-2">
					<FcLowPriority size={24} />
					<span className="text-green-400">Minor</span>
				</div>
			);
		case 'moderate':
			return (
				<div className="flex items-center gap-2">
					<FcMediumPriority color="yellow" size={24} />
					<span className="text-yellow-400">Moderate</span>
				</div>
			);
		case 'serious':
			return (
				<div className="flex items-center gap-2">
					<FcHighPriority size={24} />
					<span className="text-orange-400">Serious</span>
				</div>
			);
		case 'critical':
			return (
				<div className="flex items-center gap-2">
					<FcHighPriority size={24} />
					<span className="text-red-400">Critical</span>
				</div>
			);
		default:
			return (
				<div className="flex items-center gap-2">
					<FcElectricalSensor size={24} />
					<span className="text-gray-400">Unknown</span>
				</div>
			);
	}
}

export function AuditDetails({ audit, label }: { audit: LightHouseReport['audits']['accessibility']; label: string }) {
	return (
		<div>
			<div className="text-3xl font-bold bg-gray-600 p-4 rounded mb-10">{label} in Depth:</div>
			<div className="bg-gray-700 rounded p-4">
				<table className="table-fixed border-collapse w-full">
					<thead className="flex gap-2 w-full pb-3 mb-6 border-b border-b-gray-400">
						<tr className="flex gap-2 text-start w-full">
							<th className="text-center w-full">Score</th>
							<th className="text-center w-full">Title</th>
							<th className="text-center w-full">Description</th>
							<th className="text-center w-2/3">Rule Group</th>
							<th className="text-center w-2/3">Analysis Result</th>
							<th className="text-center w-full">In Depth:</th>
						</tr>
					</thead>
					<tbody className="w-full">
						{Object.entries(audit)
							.sort(([, auditA], [, auditB]) => auditA.group?.localeCompare(auditB.group ?? '') ?? 0)
							.map(([key, value]) => {
								const parsedData = findAudit(key);

								return (
									<tr className="flex gap-2 items-center w-full mb-2 border-b border-b-gray-400" key={key}>
										<td className="w-full">
											<SmallScoreCircle score={value.score} />
										</td>
										<td className="text-white w-full">
											{parsedData.title ? (
												<span>
													{parsedData.title} <span className="text-gray-400">({key})</span>
												</span>
											) : (
												<span className="text-gray-400">{key}</span>
											)}
										</td>
										<td
											className="text-gray-400 w-full word-wrap"
											// eslint-disable-next-line react/no-danger
											dangerouslySetInnerHTML={{
												__html: parsedData.description ?? 'Not Applicable',
											}}
										/>
										<td className="text-gray-400 text-center w-2/3">{value.group ?? 'Not Applicable'}</td>
										<td className="text-gray-400 text-center w-2/3">
											{formatExtraType(value.extra?.type ?? 'notApplicable')}
										</td>
										<td className={`flex flex-col break-all w-full ${value.extra?.fix ? '' : 'text-center'}`}>
											{value.extra?.fix ? (
												<div>
													<div className="flex justify-center">
														<FormatImpact impact={value.extra?.impact} />
													</div>
													<pre className="whitespace-pre-wrap font-sans">
														{value.extra?.fix?.replace('\n', '\n-') ?? 'Not Applicable'}
													</pre>
												</div>
											) : (
												<div className="flex justify-center">
													<FormatImpact impact={value.extra?.impact} />
												</div>
											)}
										</td>
									</tr>
								);
							})}
					</tbody>
				</table>
			</div>
		</div>
	);
}

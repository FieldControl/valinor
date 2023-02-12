'use client';

import type { GETScanEndpointReturn } from '@app/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GeneralInfo } from './UrlAnalyzerTabs/GeneralInfo';
import { PageInfo } from './UrlAnalyzerTabs/PageDetails';
import { Requests } from './UrlAnalyzerTabs/Request';
import { ScoreAndAnalysis } from './UrlAnalyzerTabs/ScoreAndAnalysis';

export function UrlAnalysisResult({ res }: { res: GETScanEndpointReturn }) {
	const { data } = res;

	const [tab, setTab] = useState<'general' | 'page_info' | 'requests' | 'score'>('general');
	const router = useRouter();

	if (!data)
		return (
			<div className="text-white">
				<h1 className="text-2xl">No data found!</h1>
			</div>
		);

	return (
		<>
			<div className="flex gap-1 p-5 mx-10 justify-evenly bg-slate-500 rounded text-white font-extrabold text-xl">
				<button
					className="h-full py-2 w-full bg-slate-700 rounded mx-8"
					onClick={() => setTab('general')}
					type="button"
				>
					General Information
				</button>
				<div className="border border-gray-200" />
				<button
					className="h-full py-2 w-full bg-slate-700 rounded mx-8"
					onClick={() => setTab('requests')}
					type="button"
				>
					Requests
				</button>
				<div className="border border-gray-200" />
				<button
					className="h-full py-2 w-full bg-slate-700 rounded mx-8"
					onClick={() => setTab('page_info')}
					type="button"
				>
					Page Details
				</button>
				<div className="border border-gray-200" />
				<button className="h-full py-2 w-full bg-slate-700 rounded mx-8" onClick={() => setTab('score')} type="button">
					Score and Analysis
				</button>
			</div>
			{tab === 'general' ? (
				<GeneralInfo result={data} router={router} />
			) : tab === 'requests' ? (
				<Requests result={data} />
			) : tab === 'page_info' ? (
				<PageInfo result={data} />
			) : (
				tab === 'score' && <ScoreAndAnalysis result={data} />
			)}
		</>
	);
}

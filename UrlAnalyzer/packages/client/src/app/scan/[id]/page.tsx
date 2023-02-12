'use client';

import { LoadingSpin } from '@app/components/Loading';
import { RandomFacts } from '@app/components/RandomFact';
import { UrlAnalysisResult as UrlAnalysisResultComponent } from '@app/components/UrlAnalysisResult';
import type { GETScanEndpointReturn } from '@app/types';
import { makeApiRequest } from '@app/utils/makeApiReq';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BiErrorAlt } from 'react-icons/bi';
import { RxDoubleArrowLeft } from 'react-icons/rx';

export default function ScanPage() {
	const search = usePathname()!;
	const id = decodeURIComponent(search.split('/').pop()!);

	const [result, setResult] = useState<GETScanEndpointReturn | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		const interval = setInterval(async () => fetch(), 5_000);
		const fetch = async () => {
			const res = await makeApiRequest<GETScanEndpointReturn>(`/scan/${id}`);

			if (res.message === 'success') {
				setResult(res);
				clearInterval(interval);
			}

			if (res.message !== 'success' && res.error?.code !== 'NavigationInProgress') {
				clearInterval(interval);
				setError(`There was an error while processing your request: ${res.error?.description ?? 'Unknown error'}`);
			}
		};

		void fetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<main className={`flex flex-col gap-4 pt-12 ${error || !result ? 'justify-between' : ''}`}>
			{result ? (
				<div className="mx-20 my-10 text-5xl font-bold font-sans p-4 bg-gray-100 rounded-xl text-center text-gray-600">
					Results for {result.data?.url}
				</div>
			) : error ? (
				<div className="flex justify-between h-full flex-col items-center gap-72">
					<div className="flex justify-center items-center w-2/3 m-20 text-5xl font-bold font-sans p-4 bg-gray-100 rounded-xl text-center text-gray-600 gap-4">
						<BiErrorAlt className="fast-animate-pulse" color="red" size={64} />
						{error}
					</div>
					<Link className="flex items-center gap-2 text-white w-fit p-3 rounded text-2xl bg-gray-500" href="/">
						<RxDoubleArrowLeft />
						Go back
					</Link>
				</div>
			) : (
				<div className="flex justify-between h-full flex-col items-center gap-72">
					<div className="flex justify-center w-2/3 items-center m-20 text-5xl font-bold font-sans bg-gray-100 rounded-xl text-center text-gray-600">
						<LoadingSpin />
						Processing your request...
					</div>
					<RandomFacts />
				</div>
			)}
			{result ? <UrlAnalysisResultComponent res={result!} /> : null}
		</main>
	);
}

'use client';

import { AnalyzerBar } from '@app/components/AnalyzerBar';
import type { GETRecentScanEndpointReturn, RawUrlAnalysis } from '@app/types';
import { makeApiRequest } from '@app/utils/makeApiReq';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RxDoubleArrowLeft, RxDoubleArrowRight } from 'react-icons/rx';

const limit = 5;

export default function Home() {
	const router = useRouter();

	const [recent, setRecent] = useState<RawUrlAnalysis[]>([]);
	const [offset, setOffset] = useState(0);
	const [total, setTotal] = useState(0);

	useEffect(() => {
		const fetchRecent = async () => {
			const res = await makeApiRequest<GETRecentScanEndpointReturn>(`/scan/recent?limit=${limit}&offset=${offset}`);

			setRecent(res.data?.data ?? []);
			setTotal(res.data?.count ?? 0);
		};

		setRecent([]);

		void fetchRecent();
	}, [offset]);

	return (
		<main className="align-middle items-center pt-[3rem] justify-center flex flex-col gap-10">
			<AnalyzerBar router={router} />
			<div className="flex flex-col bg-gray-500 p-4 rounded gap-3 justify-center max-xl:w-3/4 w-1/2 ">
				<div className="text-3xl font-bold text-white m-3 ml-5 bg-gray-600 w-fit p-2 rounded">Recent Scans:</div>
				{recent.length ? (
					recent.map((scan, idx) => (
						<div
							className={`flex flex-col text-start p-4 rounded text-white ${
								idx % 2 === 0 ? 'bg-gray-600' : 'bg-gray-700'
							}`}
							key={scan.id}
						>
							<Link className="text-2xl font-bold" href={`/scan/${scan.id}`}>
								{idx + offset + 1}° | {scan.url}
							</Link>
						</div>
					))
				) : (
					<>
						<div className="text-2xl text-start p-4 rounded text-white bg-gray-600 fast-animate-pulse">Loading...</div>
						<div className="text-2xl text-start p-4 rounded text-white bg-gray-700 fast-animate-pulse">Loading...</div>
						<div className="text-2xl text-start p-4 rounded text-white bg-gray-600 fast-animate-pulse">Loading...</div>
						<div className="text-2xl text-start p-4 rounded text-white bg-gray-700 fast-animate-pulse">Loading...</div>
						<div className="text-2xl text-start p-4 rounded text-white bg-gray-600 fast-animate-pulse">Loading...</div>
					</>
				)}
				<div className="flex justify-center">
					<button
						className={`bg-gray-600 px-2 py-1 rounded mr-2 cursor-pointer ${
							offset === 0 ? 'text-gray-400' : 'text-white'
						}`}
						disabled={offset === 0}
						onClick={() => setOffset(offset - limit)}
						type="button"
					>
						<RxDoubleArrowLeft />
					</button>
					<div className="flex items-center">
						{offset / limit + 1} of {Math.floor(total / limit) + 1}
					</div>
					<button
						className={`bg-gray-600 px-2 py-1 rounded ml-2 cursor-pointer ${
							offset / limit === Math.floor(total / limit) ? 'text-gray-400' : 'text-white'
						}`}
						disabled={offset / limit === Math.floor(total / limit)}
						onClick={() => setOffset(offset + limit)}
						type="button"
					>
						<RxDoubleArrowRight />
					</button>
				</div>
			</div>
		</main>
	);
}

'use client';

import type { POSTScanResultEndpointReturn } from '@app/types';
import { makeApiRequest } from '@app/utils/makeApiReq';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';

const onSubmit = async (elm: React.FormEvent, router: AppRouterInstance) => {
	elm.preventDefault();
	const url = document.querySelector('#url-input') as HTMLInputElement;

	if (!url.value) {
		url.style.border = '2px solid red';
		url.placeholder = 'Please enter a valid URL!';
		return;
	}

	url.style.border = '2px solid green';

	const res = await makeApiRequest<POSTScanResultEndpointReturn>('/scan/create', {
		method: 'POST',
		body: JSON.stringify({ url: url.value }),
	});

	if (res.message !== 'success') {
		url.style.border = '2px solid red';
		url.placeholder = 'Please enter a valid URL!';
		return;
	}

	router.push(`/scan/${res.data!.id}`);
};

export function AnalyzerBar({ router }: { router: AppRouterInstance }) {
	return (
		<div className="flex flex-col justify-center items-center">
			<div className="text-7xl font-bold text-white">URL Analyzer</div>
			<form
				className="mt-10 p-4 rounded flex items-center bg-gray-200 justify-between gap-3"
				onSubmit={async (elm) => onSubmit(elm, router)}
			>
				<input
					className="w-96 h-10 p-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-300"
					id="url-input"
					placeholder="Enter a URL to analyze"
					type="text"
				/>
				<button className="w-20 h-10 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600" type="submit">
					Analyze
				</button>
			</form>
		</div>
	);
}

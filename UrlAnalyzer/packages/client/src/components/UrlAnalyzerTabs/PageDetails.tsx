import type { UrlAnalysisResult } from '@app/types/types';
import type { FormatBodyReturn } from '@app/utils/formatBody';
import { formatBody } from '@app/utils/formatBody';
import { capitalizeFirstLetter } from '@app/utils/string';
import type { ConsoleMessageType } from 'puppeteer';
import { useEffect, useRef, useState } from 'react';
import { CodeRenderer } from '../CodeRenderer';

function colorFromConsoleType(type: ConsoleMessageType) {
	switch (type) {
		case 'error':
			return 'red-400';
		case 'info':
			return 'blue-400';
		case 'log':
			return 'gray-400';
		case 'warning':
			return 'yellow-400';
		default:
			return 'white';
	}
}

export function PageInfo({ result }: { result: UrlAnalysisResult }) {
	const { consoleOutput, body } = result;

	const worker = useRef<Worker>(new Worker(new URL('../../worker.ts', import.meta.url), { type: 'module' }));

	const [formatted, setFormatted] = useState<FormatBodyReturn | null>(null);
	const [isFormatted, setIsFormatted] = useState(false);

	useEffect(() => {
		const format = async () => {
			const result = await formatBody(body, 'document', worker.current);
			setFormatted(result);
			setIsFormatted(true);
		};

		void format();
	}, [body]);

	return (
		<div className="mb-10 mx-10 p-5 flex flex-col gap-8 justify-between rounded-md bg-white text-white">
			<div className=" flex flex-col gap-2">
				<div className="text-3xl font-bold bg-gray-600 p-4 rounded">Console Output</div>
				{consoleOutput.length ? (
					consoleOutput.map((item, idx) => (
						<div className="flex flex-col bg-gray-800 rounded p-4 text-xl gap-2" key={idx}>
							<div className="flex gap-2 text-start">
								<div className={`font-bold px-2 text-${colorFromConsoleType(item.type)}`}>
									{capitalizeFirstLetter(item.type)}
								</div>
								- <span className="break-all">{item.text}</span>
							</div>
							<div className="flex gap-2">
								<div className="font-bold px-2">Arguments:</div>
								{item.args.length ? JSON.stringify(item.args) : 'No arguments'}
							</div>
						</div>
					))
				) : (
					<div className="gap-2 bg-gray-400 rounded p-4 text-xl">No console output</div>
				)}
			</div>
			<div className="border border-gray-600" />
			<div className=" flex flex-col gap-2">
				<div className="text-3xl font-bold bg-gray-600 p-4 rounded">Body</div>
				{isFormatted ? (
					<pre className="bg-gray-900 rounded p-7 whitespace-pre-wrap break-all">
						<CodeRenderer data={formatted!.data} ok={formatted!.ok} />
					</pre>
				) : (
					<div className="gap-2 bg-gray-600 rounded p-4 text-3xl">Loading...</div>
				)}
			</div>
		</div>
	);
}

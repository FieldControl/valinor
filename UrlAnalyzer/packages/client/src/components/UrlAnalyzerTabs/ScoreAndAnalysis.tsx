import type { UrlAnalysisResult } from '@app/types/types';
import { useState } from 'react';
import { AuditDetails } from '../AuditDetails';
import { ScoreCircle } from '../ScoreCircle';

export function ScoreAndAnalysis({ result }: { result: UrlAnalysisResult }) {
	const { lighthouseAnalysis } = result;

	const [page, setPage] = useState<'accessibility' | 'best-practices' | 'performance' | 'pwa' | 'seo'>('accessibility');

	const label = {
		accessibility: 'Accessibility',
		'best-practices': 'Best Practices',
		performance: 'Performance',
		pwa: 'PWA (Progressive Web App)',
		seo: 'SEO (Search Engine Optimization)',
	};

	return (
		<div className="mb-10 mx-10 p-5 flex flex-col gap-8 rounded-md bg-white text-white">
			<div className="text-3xl font-bold bg-gray-600 p-4 rounded">
				General Scores <span className="text-gray-400 text-xl text-center">(To see more, click on any category)</span>{' '}
			</div>
			<div className="bg-gray-700 p-4 rounded flex justify-around gap-5">
				<div
					className={`text-center cursor-pointer ${page === 'accessibility' ? ' mb-2 border-b border-gray-400' : ''}`}
					onClick={() => setPage('accessibility')}
				>
					<ScoreCircle score={lighthouseAnalysis?.scores.accessibility} />
					<div className="font-bold font-sans text-2xl">Accessibility</div>
				</div>
				<div
					className={`text-center cursor-pointer ${page === 'best-practices' ? ' mb-2 border-b border-gray-400' : ''}`}
					onClick={() => setPage('best-practices')}
				>
					<ScoreCircle score={lighthouseAnalysis?.scores['best-practices']} />
					<div className="font-bold font-sans text-2xl">Best Practices</div>
				</div>
				<div
					className={`text-center cursor-pointer ${page === 'performance' ? ' mb-2 border-b border-gray-400' : ''}`}
					onClick={() => setPage('performance')}
				>
					<ScoreCircle score={lighthouseAnalysis?.scores.performance} />
					<div className="font-bold font-sans text-2xl">Performance</div>
				</div>
				<div
					className={`text-center cursor-pointer ${page === 'seo' ? ' mb-2 border-b border-gray-400' : ''}`}
					onClick={() => setPage('seo')}
				>
					<ScoreCircle score={lighthouseAnalysis?.scores.seo} />
					<div className="font-bold font-sans text-2xl">SEO</div>
				</div>
				<div
					className={`text-center cursor-pointer ${page === 'pwa' ? 'border-b border-gray-400' : ''}`}
					onClick={() => setPage('pwa')}
				>
					<ScoreCircle score={lighthouseAnalysis?.scores.pwa} />
					<div className="font-bold font-sans text-2xl">PWA</div>
				</div>
			</div>
			<AuditDetails audit={lighthouseAnalysis.audits[page]} label={label[page]} />
		</div>
	);
}

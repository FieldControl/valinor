import Link from 'next/link';

export function Footer() {
	return (
		<footer className="flex justify-between items-center p-4 bg-slate-800 text-gray-400">
			<div>
				<div className="border-b-gray-600 border-b">Url Analyzer</div>
				<Link href="https://github.com/Url-Analyzer/UrlAnalyzer" rel="noreferrer" target="_blank">
					Github repo
				</Link>
			</div>
			<div className="text-center">
				<div>Copywrite &copy; 2023 - Url Analyzer</div>
				<div>All rights reserved - For Educational Purposes</div>
			</div>
			<div className="flex flex-col justify-evenly text-center">
				<Link className="border-b-gray-600 border-b" href="/privacy">
					Privacy Policy
				</Link>
				<Link href="/terms">Terms of Service</Link>
			</div>
		</footer>
	);
}

import { BsArrowReturnRight } from 'react-icons/bs';
import { RxDoubleArrowRight } from 'react-icons/rx';

export function FormatHeaders({ headers, title }: { headers: Record<string, string>; title: string }) {
	return (
		<div>
			<div className="text-xl py-3 rounded font-bold">{title}:</div>
			<ul className="bg-gray-600 p-2 rounded">
				{Object.keys(headers)
					.filter((header) => header !== 'x-url-analyzer-nonce')
					.map((header) => {
						if (header === 'cookie')
							return (
								<li className="py-1 items-center" key={header}>
									<div className="flex">
										<RxDoubleArrowRight className="pr-1" />
										<div className="font-bold pr-2">{header}:</div>
									</div>
									<div>
										{headers[header]!.split(';').map((cookie) => (
											<div className="ml-5 flex" key={cookie}>
												<BsArrowReturnRight size={20} />
												<div className="px-2 font-bold">{cookie.split('=')[0]!}</div> =
												<div className="pl-2 break-all">{cookie.split('=').slice(1)}</div>
											</div>
										))}
									</div>
								</li>
							);
						return (
							<li className="py-1 flex items-center" key={header}>
								<RxDoubleArrowRight className="pr-1" /> <span className="font-bold pr-2">{header}:</span>
								<div className="break-all">{headers[header]}</div>
							</li>
						);
					})}
			</ul>
		</div>
	);
}

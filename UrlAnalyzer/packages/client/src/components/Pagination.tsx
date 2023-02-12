import { useState, useEffect } from 'react';

export function Pagination<T>({
	items,
	setItems,
	itemsPerPage,
}: {
	items: T[];
	itemsPerPage: number;
	setItems(items: T[]): void;
}) {
	const [currentPage, setCurrentPage] = useState(1);
	const [pages, setPages] = useState(1);

	useEffect(() => {
		const pages = Math.ceil(items.length / itemsPerPage);
		setPages(pages);
		setCurrentPage(1);
	}, [items, itemsPerPage]);

	useEffect(() => {
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		setItems(items.slice(start, end));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, itemsPerPage]);

	return (
		<div className="flex justify-center">
			<button
				className={`bg-gray-600 px-2 py-1 rounded mr-2 cursor-pointer ${
					currentPage === 1 ? 'text-gray-400' : 'text-white'
				}`}
				disabled={currentPage === 1}
				onClick={() => setCurrentPage(currentPage - 1)}
				type="button"
			>
				Previous
			</button>
			<div className="flex items-center">
				{currentPage} of {pages}
			</div>
			<button
				className={`bg-gray-600 px-2 py-1 rounded ml-2 cursor-pointer ${
					currentPage === pages ? 'text-gray-400' : 'text-white'
				}`}
				disabled={currentPage === pages}
				onClick={() => setCurrentPage(currentPage + 1)}
				type="button"
			>
				Next
			</button>
		</div>
	);
}

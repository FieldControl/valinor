interface PaginationProps {
    limit: number;
    total: number;
    offset: number;
    setOffset: (offset: number) => void;
}

const MAX_ITENS = 9;
const MAX_LEFT = (MAX_ITENS - 1) / 2;

export const Pagination = ({limit, total, offset, setOffset}: PaginationProps) => {
    const current = offset ? offset / limit + 1 : 1;
    const pages = Math.ceil(total / limit);
    const first = Math.max(current - MAX_LEFT, 1);

    function onPageChange(newPage: number) {
        setOffset((newPage - 1) * limit);
    }

    return (
        <ul className="flex flex-row items-center gap-2 p-4 flex-wrap">
            <li>
                <button
                onClick={() => onPageChange(current - 1)}
                disabled={current === 1}
                className='hidden md:block'
                >
                    Anterior
                </button>
            </li>
            {Array.from({length: Math.min(MAX_ITENS, pages)})
            .map((_, index) => index + first)
            .map((page) => (
                <li key={page} className="border border-gray-800 text-center rounded-md w-5 sm:w-8"  >
                    <button
                    onClick={() => onPageChange(page)}
                    className={page === current ? 'bg-gray-800 w-full ' : ''}
                    >
                        {page}
                    </button>
                </li>
            ))}
            <li>
                <button
                onClick={() => onPageChange(current + 1)}
                disabled= { current === pages}
                className='hidden md:block'
                >
                    Proxima
                </button>
            </li>
        </ul>
    )
}
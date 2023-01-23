const Pagination = ({ reposPerPage, totalRepos, paginate }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalRepos / reposPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <nav>
            <ul className="flex flex-row text-blue-600">
                {pageNumbers.map(number => (
                    <li key={number}>
                        <a onClick={() => paginate(number)} href="!#">
                            <span className="border border-blue-500 px-1.5 rounded-full">{number}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    )
}

export default Pagination;
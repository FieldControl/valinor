import { Ul } from "./styles";
import FirstPageRoundedIcon from '@material-ui/icons/FirstPageRounded';
import LastPageRoundedIcon from '@material-ui/icons/LastPageRounded';
import NavigateBeforeRoundedIcon from '@material-ui/icons/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@material-ui/icons/NavigateNextRounded';

export interface Props {
    perPage: number,
    totalOfItems: number,
    offset: number,
    setOffset: React.Dispatch<number>,
    setCurrentPage: React.Dispatch<number>
};

export const Pagination: React.FC<Props> = ({
    perPage,
    totalOfItems,
    offset,
    setOffset,
    setCurrentPage
}): JSX.Element => {

    const totalOfButtons = 9;
    const totalButtonsLeft = (totalOfButtons - 1) / 2;

    const currentPage = offset ? (offset / perPage) + 1 : 1;
    const totalPages = Math.ceil(totalOfItems / perPage) > 100 ? 100 : Math.ceil(totalOfItems / perPage);
    const maxFirst = Math.max(totalPages - (totalOfButtons - 1), 1);
    const firstButton = Math.min(
        Math.max(currentPage - totalButtonsLeft, 1),
        maxFirst
    );

    const changePage = (page: number): void => {
        setOffset((page - 1) * perPage)
        setCurrentPage(page)
    };

    return (
        <Ul>
            <button
                onClick={() => changePage(1)}
                disabled={currentPage === 1}
            >
                <FirstPageRoundedIcon/>
            </button>
            <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <NavigateBeforeRoundedIcon/>
            </button>
            {
                Array.from({ length: Math.min(totalOfButtons, totalPages) })
                    .map((_, index) => index + firstButton)
                    .map(page => (
                        <li key={page}>
                            <button onClick={() => changePage(page)}>
                                {page}
                            </button>
                        </li>
                    ))
            }
            <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <NavigateNextRoundedIcon/>
            </button>
            <button
                onClick={() => changePage(totalPages)}
                disabled={currentPage === totalPages}
            >
                <LastPageRoundedIcon/>
            </button>
        </Ul>
    );
};
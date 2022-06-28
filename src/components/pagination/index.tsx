import { BtnArrows, BtnPages, Ul } from "./styles";
import FirstPageRoundedIcon from '@material-ui/icons/FirstPageRounded';
import LastPageRoundedIcon from '@material-ui/icons/LastPageRounded';
import NavigateBeforeRoundedIcon from '@material-ui/icons/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@material-ui/icons/NavigateNextRounded';
import { Props } from "../../model/pagination";

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
            <BtnArrows
                onClick={() => changePage(1)}
                disabled={currentPage === 1}
            >
                <FirstPageRoundedIcon/>
            </BtnArrows>
            <BtnArrows
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <NavigateBeforeRoundedIcon/>
            </BtnArrows>
            {
                Array.from({ length: Math.min(totalOfButtons, totalPages) })
                    .map((_, index) => index + firstButton)
                    .map(page => (
                        <li key={page}>
                            <BtnPages 
                                onClick={() => changePage(page)}
                                page={page}
                                currentPage={currentPage}
                            >
                                {page}
                            </BtnPages>
                        </li>
                    ))
            }
            <BtnArrows
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <NavigateNextRoundedIcon/>
            </BtnArrows>
            <BtnArrows
                onClick={() => changePage(totalPages)}
                disabled={currentPage === totalPages}
            >
                <LastPageRoundedIcon/>
            </BtnArrows>
        </Ul>
    );
};
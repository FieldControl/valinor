export interface Props {
    perPage: number,
    totalOfItems: number,
    offset: number,
    setOffset: React.Dispatch<number>,
    setCurrentPage: React.Dispatch<number>
};
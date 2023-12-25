
export const reposPerPage = 4
export interface PaginationData<T> {
    currentPage: number;
    itemsPerPage: number;
    data: T[];
  }
  
  export function paginateData<T>(
    data: T[],
    currentPage: number,
    itemsPerPage: number
  ): PaginationData<T> {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  
    return {
      currentPage,
      itemsPerPage,
      data: currentItems,
    };
  }
  
  export function calculateTotalPages(totalItems: number, itemsPerPage: number): number {
    return Math.ceil(totalItems / itemsPerPage);
  }
  
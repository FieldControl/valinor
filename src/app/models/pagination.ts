export default class PaginationModel {
  page: number;
  itemsPerPage: number;
  searchText: string | undefined;

  constructor(page: number | undefined, itemsPerPage: number | undefined, seachText: string | undefined) {

    if(page === undefined){
      page = 1;
    }

    if(itemsPerPage === undefined){
      itemsPerPage = 10;
    }

    this.page = page;
    this.itemsPerPage = itemsPerPage;
    this.searchText = seachText;
  }
}

export class paginationInformation{
  page:number;
  totalCount:any;
  itemsPerPage:number;
  constructor(pageNumber:number, itensPorPagina:number){
    this.page = pageNumber;
    this.itemsPerPage = itensPorPagina;
  }
}

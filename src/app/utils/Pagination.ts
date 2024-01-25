export interface PageQuery {
  pageNumber: number,
  pageSize: number
}

export interface QueryBuilder{
  pageQuery: PageQuery;
  aditionalQuery: Map<string,string>;
  buildQueryMap(): Map<string,string>;
  buildQueryString(): string;
  buildPageQueryMap(): Map<string,string>;
}

export class PageRequest implements QueryBuilder{

  constructor(public pageQuery: PageQuery, public aditionalQuery: Map<string, string>){}

  buildQueryMap(): Map<string, string> {
    let buildQueryMap = new Map<string,string>([...this.buildPageQueryMap()]);
    if(this.aditionalQuery){
      buildQueryMap = new Map<string,string>([...buildQueryMap,...this.aditionalQuery]);
    }

    return buildQueryMap;
  }
  buildQueryString(): string {
    return Array.from(this.buildPageQueryMap()).map(itemArray=> `${itemArray[0]}=${itemArray[1]}`).join("&");
  }
  buildPageQueryMap(): Map<string, string> {
    let buildPageQueryMap = new Map<string,string>();
    buildPageQueryMap.set("page",`${this.pageQuery.pageNumber + 1}`);
    buildPageQueryMap.set("per_page",`${this.pageQuery.pageSize}`);

    return buildPageQueryMap;
  }

}

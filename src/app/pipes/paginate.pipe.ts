import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paginate'
})

//pipe para gerar a paginação
export class PaginatePipe implements PipeTransform {

  transform(array: any[], page_size: any, page_number: number): any [] {
    if(!array.length || array.length < 1) return [];
    if(page_size === 'all') {
      return array;
    }

    //modificar imagens por pagina
    page_size = page_size || 6;
    page_number = page_number || 1;
    --page_number;

    return array.slice(page_number * page_size, (page_number + 1) * page_size);
  }
}

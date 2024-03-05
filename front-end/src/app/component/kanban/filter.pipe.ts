import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(itens: any[], termo: string): any[] {
    console.log(itens);
    console.log(termo);
    if (!itens || !termo) {
      return itens;
    }
    return itens.filter(item => item.title.toLowerCase().includes(termo.toLowerCase()));
  }
}

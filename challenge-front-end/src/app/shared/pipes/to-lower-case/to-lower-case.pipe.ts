import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toLowerCase'
})
export class ToLowerCasePipe implements PipeTransform {

  /**
   * Utilizado para mostrar como se implementa um pipe
   * @param value valor a ser transformado
   * @param args Parametros passados para o pipe
   */
  transform(value: any, args?: any): any {
    try {
      if (value) {
        const transformed: string = value;
        return transformed.toLowerCase();
      }
    } catch (e) {
      console.log('Erro ToLowerCasePipe: ', e);
    }
  }

}

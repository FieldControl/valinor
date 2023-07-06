import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormatarNumerosService {

  constructor() { }

  formataNumero(numero: number): string {
    const k = 1000;
    const mil = 1000000;
    const bilhao = 1000000000;

    if (numero >= bilhao) {
      return (numero / bilhao).toFixed(1) + 'bi';
    } else if (numero >= mil) {
      return (numero / mil).toFixed(1) + 'mi';
    } else if (numero >= k) {
      return (numero / k).toFixed(1) + 'k';
    } else {
      return numero.toString();
    }
  }
}

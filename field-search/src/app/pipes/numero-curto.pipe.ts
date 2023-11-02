import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'numeroCurto'
})
export class NumeroCurtoPipe implements PipeTransform {

    transform(num: number, args?: any): any {
        if (isNaN(num)) return null;
        if (num === null) return null;
        if (num === 0) return null;
        let abs = Math.abs(num);
        const rounder = Math.pow(10, 1);
        const isNegativo = num < 0;
        let key = '';

        const potencia = [
            {key: 'Q', valor: Math.pow(10, 15)},
            {key: 'T', valor: Math.pow(10, 12)},
            {key: 'B', valor: Math.pow(10, 9)},
            {key: 'M', valor: Math.pow(10, 6)},
            {key: 'K', valor: 1000}
        ];

        for (let i = 0; i < potencia.length; i++) {
            let reduced = abs / potencia[i].valor;
            reduced = Math.round(reduced * rounder) / rounder;
            if (reduced >= 1) {
                abs = reduced;
                key = potencia[i].key;
                break;
            }
        }
        return (isNegativo ? '-' : '') + abs + key;
    }
}
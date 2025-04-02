import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortBy',
  standalone: true,
  pure: false
})
export class SortByPipe implements PipeTransform {
  transform<T extends Record<K, any>, K extends keyof T>(array: T[], property: K): T[] {
    // Se o array não existir ou for vazio, retorna como está
    if (!array || !Array.isArray(array) || array.length === 0) {
      return array;
    }
    
    // Clone o array para não modificar o original
    return [...array].sort((a, b) => {
      // Garantir que os itens existam
      if (!a || !b) return 0;
      
      // Extrair valores a serem comparados
      const valA = a[property];
      const valB = b[property];
      
      // Tratamento específico para a propriedade 'order'
      if (property === 'order') {
        const numA = typeof valA === 'number' ? valA : 0;
        const numB = typeof valB === 'number' ? valB : 0;
        return numA - numB;
      }
      
      // Tratamento para valores nulos e undefined
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      
      // Comparação padrão
      return valA < valB ? -1 : valA > valB ? 1 : 0;
    });
  }
} 
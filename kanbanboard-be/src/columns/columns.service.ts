import { Injectable } from '@nestjs/common';
import { Column } from './columns.model';

@Injectable()
export class ColumnsService {

  private columns: Column[] = [
    new Column('Provados', ['Chocolate', 'Nutella', 'Kinder Ovo']),
    new Column('Para Experimentar', ['Alfajor', 'Doce de Leite', 'Limão']),
    new Column('Favoritos', ['Ninho', 'Chocolate Branco', 'Negresco']),
    new Column('Não gostei', ['Chocomenta', 'Coco', 'Morango']),
  ];

  getColumns() {
    return this.columns;
  } 
}
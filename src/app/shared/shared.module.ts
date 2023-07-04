import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BotoesComponent } from './components/ag-grid-components/botoes/botoes.component';
import { AgGridModule } from 'ag-grid-angular';
import { LoadingAgGridComponent } from './components/ag-grid-components/loading-ag-grid/loading-ag-grid.component';

@NgModule({
  declarations: [BotoesComponent, LoadingAgGridComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridModule,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    AgGridModule,
  ],
})
export class SharedModule {}

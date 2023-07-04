import { Component } from '@angular/core';
import { ILoadingOverlayAngularComp } from 'ag-grid-angular';
import { ILoadingOverlayParams } from 'ag-grid-community';

@Component({
  selector: 'app-loading-ag-grid',
  templateUrl: './loading-ag-grid.component.html',
  styleUrls: ['./loading-ag-grid.component.css']
})
export class LoadingAgGridComponent implements ILoadingOverlayAngularComp  {

  public params: any;

  agInit(params: ILoadingOverlayParams): void {
    this.params = params;
  }
}

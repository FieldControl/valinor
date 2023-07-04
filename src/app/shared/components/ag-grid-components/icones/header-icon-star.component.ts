import { Component } from "@angular/core";
import { IHeaderAngularComp } from "ag-grid-angular";

@Component({
    selector: "app-header-icon",
    template: `
    <span class="ag-header-cell-text">Favorito </span>
    <span class="ag-header-icon">
      <i class="fa-solid fa-star"></i>
    </span>
  `
})
export class HeaderIconComponent implements IHeaderAngularComp {   

    public params: any;

    agInit(params: any): void {
        this.params = params;
    }

    getGui(): HTMLElement {
        return this.params.eGui;
    }

    refresh(): boolean {
        return false;
      }
}

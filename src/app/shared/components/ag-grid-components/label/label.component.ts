import { Component, AfterViewInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss']
})
export class LabelComponent implements ICellRendererAngularComp, AfterViewInit {

  public params: any;
  public dados: any;
  public class: any;

  agInit(params: any): void {
    this.params = params;
  }

  ngAfterViewInit(): void {
    const { nomeComponente } = this.params.context.componentParent;
    const data: any = "";

    this.componentesModuloAdministrativo(nomeComponente, data);
    this.componentesModuloCliente(nomeComponente, data);

  }

  private componentesModuloAdministrativo(nomeComponente: string, data: any) {
    switch (nomeComponente) {
      case "ListaFilaGeral":
        data = this.params.data.cronologias[this.params.data.cronologias.length - 1]
        this.params = data.statusEnumString
        this.class = data.setarCorStatus
        break;

      case "ListaFilaIndividual":
        data = this.params.data.cronologias[this.params.data.cronologias.length - 1]
        this.params = data.statusEnumString
        this.class = data.setarCorStatus
        break;

      case "ListaChamados":
        data = this.params.data.cronologias[this.params.data.cronologias.length - 1]
        this.params = data.statusEnumString
        this.class = data.setarCorStatus
        break;
    }
  }

  private componentesModuloCliente(nomeComponente: string, data: any) {
    switch (nomeComponente) {
      case "ListaFilaGeralCliente":
        data = this.params.data.cronologias[this.params.data.cronologias.length - 1]
        this.params = data.statusEnumString
        this.class = data.setarCorStatus
        break;
    }
  }


  refresh(): boolean {
    return false;
  }

}

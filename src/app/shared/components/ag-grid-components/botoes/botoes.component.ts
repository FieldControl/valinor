import { Component, AfterViewInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-botoes',
  templateUrl: './botoes.component.html',
  styleUrls: ['./botoes.component.scss']
})
export class BotoesComponent implements ICellRendererAngularComp, AfterViewInit {

  public botoesAgGrid: BotoesAgGrid = new BotoesAgGrid();
  public opcoesBotoesAgGrid: OpcoesBotoesAgGrid = new OpcoesBotoesAgGrid();
  public params: any;

  agInit(params: any): void {
    this.params = params;
  }

  ngAfterViewInit() {
    this.botoesAgGrid = this.params.context.botoesAgGrid;
    this.opcoesBotoesAgGrid = this.params.opcoesBotoesAgGrid;
    
  }

  atribuirParaEditar() {
    if (this.opcoesBotoesAgGrid?.btnEditar?.desabled) return
    this.params.context.componentParent.atribuirParaEditar(this.params.node.data)
  }

  atribuirParaVisualizar() {
    if (this.opcoesBotoesAgGrid?.btnVisualizar?.desabled) return
    this.params.context.componentParent.atribuirParaVisualizar(this.params.node.data)
  }

  atribuirParaVisualizarHistorico() {
    if (this.opcoesBotoesAgGrid?.btnVisualizarHistorico?.desabled) return
    this.params.context.componentParent.atribuirParaVisualizarHistorico(this.params.node.data)
  }

  atribuirParaExecao() {
    if (this.opcoesBotoesAgGrid?.btnVisualizarExecao?.desabled) return
    this.params.context.componentParent.atribuirParaExecao(this.params.node.data)
  }

  excluir() {
    if (this.opcoesBotoesAgGrid?.btnExcluir?.desabled) return
    Swal.fire({
      title: 'Excluir',
      text: "Realmente deseja excluir?",
      icon: 'warning',
      showCancelButton: true,
      focusCancel: true,
      confirmButtonColor: '#00b19d',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, deletar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.params.context.componentParent.excluir(this.params.node.data)
      }
    })
  }

  atribuirParaAprovarDocumento() {
    if (this.opcoesBotoesAgGrid?.btnAprovarDocumento?.desabled) return
    this.params.context.componentParent.atribuirParaAprovarDocumento(this.params.node.data)
  }

  atribuirParaReprovarDocumento() {
    if (this.opcoesBotoesAgGrid?.btnReprovarDocumento?.desabled) return
    this.params.context.componentParent.atribuirParaReprovarDocumento(this.params.node.data)
  }

  atribuirParaImprimir() {
    if (this.opcoesBotoesAgGrid?.btnImprimir?.desabled) return
    this.params.context.componentParent.atribuirParaImprimir(this.params.node.data)
  }

  atribuirParaQRCode(){
    if (this.opcoesBotoesAgGrid?.btnQrCode?.desabled) return
    this.params.context.componentParent.atribuirParaQRCode(this.params.node.data)
  }

  refresh(): boolean {
    return false;
  }
}

export class BotoesAgGrid {
  public btnVisualizar?: boolean = true;
  public btnEditar?: boolean;
  public btnExcluir?: boolean;
  public btnVisualizarHistorico?: boolean;
  public btnVisualizarExecao?: boolean;

  public btnAprovarDocumento?: boolean;
  public btnReprovarDocumento?: boolean;

  public btnImprimir?: boolean;
  public btnQrCode?: boolean;
}

export class OpcoesBotoesAgGrid {
  public btnVisualizar?: OptionsButton;
  public btnEditar?: OptionsButton;
  public btnExcluir?: OptionsButton;
  public btnVisualizarHistorico?: OptionsButton;
  public btnVisualizarExecao?: OptionsButton;

  public btnAprovarDocumento?: OptionsButton;
  public btnReprovarDocumento?: OptionsButton;

  public btnImprimir?: OptionsButton;
  public btnQrCode?: OptionsButton;
}


export class OptionsButton {
  public desabled?: boolean;
  public invisible?: boolean;
}
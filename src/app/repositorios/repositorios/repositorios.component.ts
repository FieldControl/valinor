import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { EmitirAlerta } from 'src/app/shared/helpers/sweet-alertas';
import { ColDef, GridApi, GridOptions, IGetRowsParams } from 'ag-grid-community';
import { TraducaoAgGrid } from 'src/app/shared/helpers/traducao-ag-grid';
import { BotoesAgGrid, BotoesComponent } from 'src/app/shared/components/ag-grid-components/botoes/botoes.component';
import { LoadingAgGridComponent } from 'src/app/shared/components/ag-grid-components/loading-ag-grid/loading-ag-grid.component';
import { HeaderIconComponent } from 'src/app/shared/components/ag-grid-components/icones/header-icon-star.component';
import { RepositoriosService } from '../services/repositorios.service';

@Component({
  selector: 'app-repositorios',
  templateUrl: './repositorios.component.html',
  styleUrls: ['./repositorios.component.scss'],
})
export class RepositoriosComponent implements OnInit {

  public colunasTabela?: Array<ColDef>;
  public gridOptions: Partial<GridOptions<string>> = {};
  public cacheOverflowSize?: number;
  public maxConcurrentDatasourceRequests?: number;
  public definicaoPadraoColunas?: ColDef;
  public traducaoAgGrid: any;
  public frameworkComponents: any;
  public loadingOverlayComponent: any;
  public gridContext: any;
  public gridApi?: GridApi;
  public gridDadosApi?: IGetRowsParams;
  public gridColumnApi: any;
  public carregando?: boolean;
  public botoesAgGrid?: BotoesAgGrid;
  public existeLista: boolean;
  public urlRepositorio?: string

  constructor(
    private repositoriosService: RepositoriosService,
    protected injector: Injector,
    private formBuilder: FormBuilder,
  ) { 
    this.existeLista = false
  }

  ngOnInit(): void {
    this.configurarAgGrid();
    this.definirColunasAgGrid();
  }

  formulario = this.formBuilder.group({
    nomeRepositorio: [null, Validators.required],
  });

  obterRepositorio() {
    EmitirAlerta.AlertaCarregando();
    this.repositoriosService.obterRepositorio(this.formulario.controls.nomeRepositorio.value).subscribe({
      next: (data) => {
        this.existeLista = true;
        this.gridDadosApi?.successCallback(data ? data.items : [], data ? data.items.length : 0);
        EmitirAlerta.FecharAlertaCarregando();
      },
      error: () => {
        this.existeLista = false;
        this.acaoQuandoForError();
        EmitirAlerta.FecharAlertaCarregando();
      }
    })
  }

  acaoQuandoForError(mensagem?: string): any {
    this.gridDadosApi?.failCallback();

    if ((mensagem)) return EmitirAlerta.AlertaToastError(mensagem);
    return EmitirAlerta.AlertaToastError("Ocorreu um erro ao processar a sua solicitação!")
  }

  configurarAgGrid() {
    this.cacheOverflowSize = 2;
    this.maxConcurrentDatasourceRequests = 2;

    this.gridOptions = {
      cacheBlockSize: 15,
      paginationPageSize: 15,
      rowModelType: 'infinite',
      enableCellTextSelection: true
    }

    this.definicaoPadraoColunas = {
      resizable: true,
      floatingFilter: false,
      sortable: true,
    };

    this.gridContext = {
      componentParent: this,
      botoesAgGrid: { btnVisualizar: true }
    };

    this.traducaoAgGrid = TraducaoAgGrid.Traduzir();
    this.frameworkComponents = {
      customLoadingOverlay: LoadingAgGridComponent,
      childMessageRenderer: BotoesComponent,
    };

    this.loadingOverlayComponent = 'customLoadingOverlay';
  }

  inicializarAgGrid(event: any) {
    this.gridApi = event.api;
    this.gridColumnApi = event.columnApi;

    const datasource = {
      getRows: (params: IGetRowsParams) => {
        this.gridDadosApi = params;


        this.obterRepositorio();
      }
    }
    
    this.gridApi?.setDatasource(datasource);
  }

  mostrarCarregandoAgGrid() {
    if (!this.gridApi) return;
    this.gridApi.showLoadingOverlay();
  }

  esconderCarregandoAgGrid() {
    this.gridApi?.hideOverlay();
  }

  definirColunasAgGrid(): void {
    this.colunasTabela = [
      {
        headerName: 'Nome',
        field: 'full_name',
        suppressMenu: true,
        filter: true,
        suppressSizeToFit: false,
        width: 250
      },
      {
        headerName: 'Descrição',
        field: 'description',
        suppressMenu: true,
        filter: true,
        suppressSizeToFit: false,
        width: 300
      },
      {
        headerName: 'Linguagem',
        field: 'language',
        suppressMenu: true,
        filter: true,
        suppressSizeToFit: false,
        width: 120
      },
      {
        headerName: 'Tópicos',
        field: 'topics',
        suppressMenu: true,
        filter: true,
        suppressSizeToFit: false,
        width: 250
      },
      {
        headerComponentFramework: HeaderIconComponent,
        field: 'stargazers_count',
        suppressMenu: true,
        filter: true,
        suppressSizeToFit: false,
        width: 100,
        cellRenderer: (params: any) => {
          if (params.value > 999) {
            const formattedValue = Math.floor(params.value / 1000) + 'k';
            return formattedValue;
          } else {
            return params.value;
          }
        }
      },
      {
        headerName: 'Atualização',
        field: 'updated_at',
        suppressMenu: true,
        filter: true,
        suppressSizeToFit: false,
        width: 120,
        valueFormatter: function(params) {
          const date = new Date(params.value);
          const dia = date.getDate();
          const mes = date.getMonth() + 1;
          const ano = date.getFullYear();
          return `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${ano}`;
        }
      },
      {
        headerName: 'Ações',
        cellRenderer: "childMessageRenderer",
        suppressSizeToFit: false,
        width: 100,
      }
    ]
  }

  atribuirParaVisualizar(dados: any) {
    console.log(dados);
    
    this.urlRepositorio = dados.html_url;
    window.open(this.urlRepositorio, '_blank');
  }

}

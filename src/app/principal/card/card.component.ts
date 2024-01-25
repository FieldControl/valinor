import { Component, OnInit, ViewChild } from '@angular/core';
import { PesquisaService } from '../pesquisa.service';
import { Pesquisa } from '../Pesquisa';
import Swal from 'sweetalert2';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { take } from 'rxjs';
import { PageRequest } from 'src/app/utils/Pagination';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

  pesquisa: string = "";
  next: string = "";
  previous: string = "";
  pageSizeOptions: number[] = [3];
  pageSize: number = 3;
  per_page: number = 0;
  links: any = {
    next: '',
    prev: '',
    first: '',
    last: ''
  };
  respostaPesquisa: Pesquisa | null = {
    totalCount: 0,
    incomplete_results: false,
    items: []
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageEvent!: PageEvent;

  constructor(private service: PesquisaService) { }

  ngOnInit(): void {
  }

  pesquisar(url:string|null = null) {
    // alert(this.pesquisa);
    Swal.fire({
      title: "Carregando",
      text: "Estamos carregando as informações",
      didOpen: () => {
        Swal.showLoading();
      },
    });
    this.service.pesquisar(this.pesquisa,url).subscribe((response: any) => {
      debugger;
      this.service.processResponse(response);
      this.links = this.service.processResponse(response.headers)
      this.respostaPesquisa = response.body;
      console.log(this.links);
      Swal.close();
    });
  }

  onPageChange(event: PageEvent) {
    let url: string|null;
    // Verifique se é a próxima página ou a anterior baseado no índice da página
    if (event.pageIndex === this.paginator.pageIndex + 1) {
      url = this.service.nextUrl;
    } else if (event.pageIndex === this.paginator.pageIndex - 1) {
      url = this.service.prevUrl;
    } else {
      return; // Se não for anterior ou próxima, não faça nada (ou trate primeiro e último se necessário)
    }

    this.service.changePage(url!).subscribe(response => {
      this.service.processResponse(response);
      this.respostaPesquisa = response.body;
    });
  }
}

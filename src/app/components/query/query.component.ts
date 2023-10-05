import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QueryService } from './query.service';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
})
export class QueryComponent implements OnInit {
  title = 'Valinor';
  parametro!: string;
  api:any = [];
  isLoading = true;
  
  constructor(private route: ActivatedRoute, private queryService: QueryService) { }

  ngOnInit(): void {
    this.parametro = this.route.snapshot.params['parametro'];
    this.queryService.getTicket(this.parametro).subscribe(
      response => { 
        this.isLoading = false;
        this.api = response
    },
      (error) => {
      console.error('Erro ao buscar dados da API', error);
      this.isLoading = true; 
      }
    )
  }


}



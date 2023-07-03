import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {

  public getAllPokemons: any;
  private setAllPokemons: any;
  public apiError: boolean = false;
  public page: any = 0;
  public limit: any = 8;
  public totalDocs: number = 0;

  constructor(
    public router: Router,
    private api: ApiService) {}

  ngOnInit(): void {
    this.api.apiListAllPokemons().subscribe(
      res => {
       this.setAllPokemons = res.results
       this.getAllPokemons = this.setAllPokemons


// if(this.getAllPokemons){

//   for (let poke of this.getAllPokemons) {
//     console.log(poke.status.id)
//    }
// }
      },
      error => {
        this.apiError = true
      }
    )
  }

  getSearch(value: string){
    const filter = this.setAllPokemons.filter((res: any) => {
      return !res.name.indexOf(value.toLowerCase())
    })

    this.getAllPokemons = filter;
  }

  public pageChange(event: any) {
    this.page = event;
  }
}

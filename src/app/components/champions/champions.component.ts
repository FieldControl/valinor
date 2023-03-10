import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ListChampionService } from 'src/app/services/list-champion.service';
import { Champion } from 'src/app/Champion';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';
@Component({
  selector: 'app-champions',
  templateUrl: './champions.component.html',
  styleUrls: ['./champions.component.css'],
})
export class ChampionsComponent implements OnInit {
  champions: Champion[] = [];
  pageNow? = this.pageEvent?.pageIndex;

  searchText = new FormControl('');

  maxCount: any;
  pageIndex: any;
  loading?: boolean
  pageEvent?: PageEvent | undefined;
  timer: any

  constructor(private ChampionService: ListChampionService) {
    this.loading = true
    this.listChampions(0, 8);
  }
  ngOnInit(): void {
    this.searchText.valueChanges.pipe(
      debounceTime(700)
    ).subscribe((text) => {
      if (!text) {
        this.listChampions() 
        return
      };
      
      this.listChampions()
    });

    
  }
  
  listChampions(page?: any, limit?: any): any{
    let texto = this.searchText.value;
    if (!page) page = 0;
    if (!limit) limit = 8;
    if (texto) {
      this.ChampionService.getChampions(page + 1, limit, texto)
      .subscribe(response => {
        this.maxCount = response.totalCount;
        this.champions = response.champions;
        this.loading = false
      });
      this.pageIndex = 1;
      
      return;
    }
    this.ChampionService.getChampions(page + 1, limit, this.searchText.value)
    .subscribe(response => {
      this.maxCount = response.totalCount;
      this.champions = response.champions;
      this.loading = false
    });
  }
 
}

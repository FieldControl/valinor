import { Champion } from '../shared/champion.model';
import { PageEvent } from '@angular/material';
import { ChampionService } from '../shared/champion.service';
import { Component, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-champions-view',
  templateUrl: './champions-view.component.html',
  styleUrls: ['./champions-view.component.css']
})
export class ChampionsViewComponent implements OnInit {

  constructor(private championsService: ChampionService) { }

  searchText = ''
  searchNode: boolean = true
  championList: Champion[] = []
  championSearchList: Champion[] = []
  getIndex1: number = 0
  getIndex2: number = 10

  public ngOnInit() {
    this.championsService.getChampions(0, 10).subscribe(champions => {
      this.championList = champions
      this.pageLength = 162
    })
  }

  @Output() pageLength = 162
  pageSize = 10;
  @Output() pageIndex = 0;
  pageSizeOptions1 = [1, 11, 21, 31, 41, 51, 61, 71, 81, 91, 101, 111, 121, 131, 141, 151, 161];
  pageSizeOptions2 = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 162];

  pageEvent: PageEvent = new PageEvent;

  onPageChange(event: PageEvent) {
    this.pageEvent = event;
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.getIndex1 = this.pageSizeOptions1[this.pageIndex]
    this.getIndex2 = this.pageSizeOptions2[this.pageIndex]

    if (this.searchNode) {
      this.championsService.getChampions(this.getIndex1, this.getIndex2).subscribe(champions => {
        this.championList = champions
      })
    } else {
      this.championList = this.championSearchList.slice(this.getIndex1 - 1, this.getIndex2)
    }
  }

  championSearch() {
    if (this.searchText !== '') {
      this.pageIndex = 0
      this.championsService.findChampion(this.searchText).subscribe(champions => {
        this.championSearchList = champions
        this.championList = this.championSearchList.slice(0, 10)
        this.pageLength = this.championSearchList.length
        this.searchNode = false
      })
      return
    }
    this.championsService.getChampions(0, 10).subscribe(champions => {
      this.championList = champions
      this.pageLength = 162
      this.searchNode = true
    })
  }
}

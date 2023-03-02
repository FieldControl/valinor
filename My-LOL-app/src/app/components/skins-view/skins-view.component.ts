import { PageEvent } from '@angular/material';
import { Champion } from '../shared/champion.model';
import { ChampionService } from '../shared/champion.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-skins-view',
  templateUrl: './skins-view.component.html',
  styleUrls: ['./skins-view.component.css']
})
export class SkinsViewComponent implements OnInit {

  constructor(private championsService: ChampionService) { }

  searchNode: boolean = true
  championList: Champion[] = []
  championSearchList: Champion[] = []
  getIndex1: number = 0
  getIndex2: number = 10

  ngOnInit() {
    this.championsService.getChampions(0, 1).subscribe(champions => {
      this.championList = champions
      this.pageLength = 162
    })
    for (let i = 1; i <= 162; i++) {
      this.pageSizeOptions1.push(i)
    }
  }

  pageLength = 162
  pageSize = 1;
  pageIndex = 0;
  pageSizeOptions1: number[] = [];

  pageEvent: PageEvent = new PageEvent;

  onPageChange(e: PageEvent) {
    this.pageEvent = e;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.getIndex1 = this.pageSizeOptions1[this.pageIndex]

    if (this.searchNode) {
      this.championsService.getChampions(this.getIndex1, this.getIndex1).subscribe(champions => {
        this.championList = champions
      })
    } else {
      this.championList = this.championSearchList.slice(this.getIndex1 - 1, this.getIndex1)
    }
  }

  championSearch(event: Event) {
    let target = event.target as HTMLButtonElement

    let inputText = target.value

    if (inputText == '') {
      this.championsService.getChampions(0, 1).subscribe(champions => {
        this.championList = champions
        this.pageLength = 162
        this.searchNode = true
        this.pageIndex = 0
      })
    } else {
      this.pageIndex = 0
      this.championsService.findChampion(inputText).subscribe(champions => {
        this.championSearchList = champions
        this.championList = this.championSearchList.slice(0, 1)
        this.pageLength = this.championSearchList.length
        this.searchNode = false
      })
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {  SearchService } from 'src/app/services/search.service';
import { Player } from 'src/app/PlayerInfos.1';
import { ListChampionService } from 'src/app/services/list-champion.service';
import { Champion } from 'src/app/Champion';
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  player!: Player;
  searchValue = new FormControl('')
  winrate?: number;
  champions: Champion[] = []
  noContant: boolean = true;
  

  constructor(
    private SearchService: SearchService,
    private ChampionService: ListChampionService 
  ){
  }
  ngOnInit(){
    this.searchValue.valueChanges.subscribe(text =>{
      if(!text) return
    })
    
  }

  searchPlayer(): void {
    let textValue = this.searchValue.value
    //textValue!
    this.SearchService.seachProfile(textValue!)
    .subscribe
    ((response) =>{
      const [player, topChampions, leagues] = response
      player.topChampions = topChampions
      player.leagues = leagues
      this.player = player
      if(leagues.length){
        this.winrate = this.player.leagues[0].wins / (this.player?.leagues[0].wins + this.player?.leagues[0].losses) * 100
      
        player.leagues[0].winRate = this.winrate.toFixed(0)
      }
      
      if(topChampions){this.ChampionService.getChampionByKey(
      this.player.topChampions[0].championId, 
      this.player.topChampions[1].championId, 
      this.player.topChampions[2].championId)
      .subscribe(
      (response) =>{
        this.champions = response
        this.noContant = false
      })}
    }
    )
  }

}

import { Component, OnInit } from '@angular/core';
import { ChampionsService } from '../../Services/champions.service';
import { IChampion } from '../../Interfaces/champions.interface';

@Component({
  selector: 'app-champions-free',
  templateUrl: './champions-free.component.html',
  styleUrls: ['./champions-free.component.scss']
})
export class ChampionsFreeComponent implements OnInit {
  champions: IChampion[] = [];
  isLoading: boolean = false;

  items: string[] = [
    '../../../../assets/imgs/champion.png',
    '../../../../assets/imgs/champion.png',
    '../../../../assets/imgs/champion.png',
    '../../../../assets/imgs/champion.png',
    '../../../../assets/imgs/champion.png',
    '../../../../assets/imgs/champion.png',
    '../../../../assets/imgs/champion.png',

  ]; translateX: number = 0;
  currentIndex: number = 0;

    championsFree: string[] = [
    'jinx',
    'anivia',
    'ivern',
    'mordekaiser',
    'garen',
    'malphite',
    'sylas',
    'tristana',
  ];



  constructor(private championsService: ChampionsService){}

  ngOnInit(): void {
   this.listChampionsFree();
  }

  listChampionsFree(){
    this.isLoading = true;
    for (const champion of this.championsFree)
    {
      this.championsService.getChampionByName(0, 10, champion).subscribe(response => {
        this.championsFree.push(champion)
        let championsData = response.champions;
        let mappedChampions = null;

        mappedChampions = championsData.slice(0, 1).map(
          (champion: {
            node: {
              uid: any;
              champion_splash: any;
              champion_name: any;
              difficulty: any;
            };
          }) => {
            return {
              uid: champion.node.uid,
              champion_splash: champion.node.champion_splash,
              champion_name: champion.node.champion_name,
              difficulty: champion.node.difficulty,
            };
          }
        );

        this.champions.push(...mappedChampions);
        this.isLoading = false;
      })
    }

  }


  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.champions.length) % this.champions.length;
    this.translateX = -this.currentIndex * 450;
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.champions.length;
    this.translateX = -this.currentIndex * 450;
  }
}




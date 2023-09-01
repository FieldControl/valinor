import { Component, OnInit } from '@angular/core';
import { Item } from './item.model'; // Importe a interface Item
import { ChampionsService } from '../../Services/champions.service';
import { IChampion } from '../../Interfaces/champions.interface';
import { BaseComponent } from 'src/shared/Components/base-component/base-component.component';

@Component({
  selector: 'app-champions',
  templateUrl: './champions.component.html',
  styleUrls: ['./champions.component.scss'],
})
export class ChampionsComponent extends BaseComponent implements OnInit {
  champions: IChampion[] = [];

  searchText: string = '';
  currentPage: number = 0;
  itemsPerPage: number = 10;
  totalItens: number = 0;

  constructor(private championService: ChampionsService) {super()}

  ngOnInit(): void {
    this.listChampions(0);
  }

  get displayedItems() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredItems.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItens / this.itemsPerPage);
  }

  get filteredItems(): IChampion[] {
    return this.champions.filter((item) =>
      item.champion_name?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  listChampions(page: number) {
    this.loading = true;
    this.champions = [];


    setTimeout(() => {
      this.championService.listChampions(page, 10).subscribe(
        (response) => {
          const championsData = response.champions;
          this.loading = false;

          let mappedChampions = null;
          this.totalItens = response.page.totalCount;

          mappedChampions = championsData.slice(0, 10).map(
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
          if (mappedChampions.length == 4) {
            this.itemsPerPage = response.champions.length;
            let champion: IChampion = {
              champion_splash: '../../../../assets/imgs/fundopreto.png',

            };

            for (let i = 0; i <= 5; i++) {
              this.champions.push(champion!);
            }
          }



        },
        (err) => {
          console.error(err);
        }
      );
    }, 1000);


  }

  searchChampion() {
    this.loading = true;
    this.champions = [];

    this.championService.getChampionByName(0,10, this.searchText).subscribe(
      (response) => {
        let championsData = response.champions;
        let mappedChampions = null;
        this.itemsPerPage = response.champions.length;
        this.loading = false;


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

        if (mappedChampions.length == 1) {
          let champion: IChampion = {
            champion_splash: '../../../../assets/imgs/fundopreto.png',

          };


          for (let i = 0; i <= 0; i++) {
            this.champions.push(champion!);
          }
        }
      },
      (err) => {
        alert("NÃO FOI POSSÍVEL LISTAR OS CAMPEÕES")
        this.loading = false;
      }
    );
  }

  search(){
    if(this.searchText.length > 0) {
      this.searchChampion()
    }
    else {
      this.listChampions(this.currentPage)
    }
  }

  prevPage(optionalPage?: any): void {
    if(this.currentPage == 16) {
      this.itemsPerPage = 10;
    }
    if (this.currentPage > 0 && optionalPage == undefined) {
      this.currentPage--;
      this.listChampions(this.currentPage);
    } else {
      this.listChampions(optionalPage);
      this.itemsPerPage = 10;
      this.currentPage = optionalPage;
    }
  }

  nextPage(optionalPage?: any): void {

    if (this.currentPage < this.totalPages && optionalPage == undefined) {
      this.currentPage++;
      this.listChampions(this.currentPage);
    } else {
      this.listChampions(optionalPage);
      this.currentPage = optionalPage;
    }
  }
}

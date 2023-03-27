import { Component, OnInit, ViewChild } from '@angular/core';
import { Hero } from 'src/app/shared/model/hero.model';
import { HeroesService } from 'src/app/shared/services/heroes.service';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'da-hero-list',
  templateUrl: './heroes-list.component.html',
  styleUrls: ['./heroes-list.component.scss'],
  providers: [HeroesService]
})

export class HeroesListComponent implements OnInit{
  
  heroes: Hero[] = []
  filteredHero: Hero[] = [];
  pagedHero: Hero[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _searchHero = ''
  
  get searchHero(): string {
    return this._searchHero;
  }

  set searchHero(value: string) {
    this._searchHero = value;
    this.filteredHero = this.searchFilter(value);
    this.pagedHero = this.filteredHero;

    this.paginator.firstPage();
  }

  searchFilter(filterBy: string): Hero[] {
    filterBy = filterBy.toLocaleLowerCase();
    return this.heroes.filter((hero: Hero) =>
      hero.localized_name.toLocaleLowerCase().includes(filterBy));
  }

  constructor(private heroService: HeroesService) {}

 ngOnInit(): void {
  this.getHeroes(); 

 }

 getHeroes(): void {
  this.heroService.getHeroesData().subscribe((data) => {
    this.heroes = data;

    this.heroes.map ((attr) => {
      if(attr.primary_attr === 'agi') {
        attr.primary_attr = 'agility'
      };
      if(attr.primary_attr === 'int') {
        attr.primary_attr = 'intelligence'
      };
      if(attr.primary_attr === 'str') {
        attr.primary_attr = 'strength'
      }

      this.heroes.forEach((item, i) => {
        item.new_Id = i + 1;
      });
    })
    
    this.filteredHero = this.heroes;
    this.pagedHero = this.filteredHero;

  })
 }

 filterHeroes(value: string): any {
  if(value === 'strength') {
    this.filteredHero = [...this.heroes].filter(e => e.primary_attr === 'strength');
    this.pagedHero = this.filteredHero;
    this.paginator.firstPage();
  }

  if(value === 'intelligence') {
    this.filteredHero = [...this.heroes].filter(e => e.primary_attr === 'intelligence');
    this.pagedHero = this.filteredHero;
    this.paginator.firstPage();
  }

  if(value === 'agility') {
    this.filteredHero = [...this.heroes].filter(e => e.primary_attr === 'agility');
    this.pagedHero = this.filteredHero;
    this.paginator.firstPage();
  }

  if(value === 'all') {
    this.filteredHero = [...this.heroes];
    this.pagedHero = this.filteredHero;
    this.paginator.firstPage();
  }
}

 onPageChange($event: { pageIndex: number; pageSize: number; }) {
  this.pagedHero = [...this.filteredHero].slice($event.pageIndex*$event.pageSize, $event.pageIndex*$event.pageSize + $event.pageSize);  
 }

}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

declare function Load(): any;
declare function Unload(): any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.component.html',
  styleUrls: ['home.page.component.scss'],
})
export class HomePageComponent implements OnInit, OnDestroy {
  teste: string = '';

  constructor(private router : Router) {}

  ngOnInit(): void {
    Load();
  }

  ngOnDestroy(): void {
    Unload();
  }

  navigateToMarvel(){
    this.router.navigate(['menu/marvel']);
  }

  navigateToStarWars(){
    this.router.navigate(['menu/starwars']);
  }
}

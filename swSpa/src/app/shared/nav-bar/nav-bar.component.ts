import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { StarWarsService } from 'src/app/core/star-wars.service';
import { People } from 'src/app/models/people.model';


@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  searchControl: FormControl = new FormControl('');
  searchText: string = '';
  peoples: People[] = [];

  constructor(private _swService: StarWarsService) { }

  ngOnInit(): void {
    this.searchControl = new FormControl('', Validators.required);
  }

  async doSearch(text: string) {
    if(!text) {
      await this._swService.getPeople().subscribe(res => {
        this.peoples = res;
        console.log(this.peoples);
      })
    } else {
      await this._swService.searchPeople(text).subscribe(res => {
        this.peoples = res;
        console.log(this.peoples);
      })
    }
    console.log(text);
  }

}

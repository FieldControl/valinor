import { Component, OnInit } from '@angular/core';
import { StarWarsService } from 'src/app/core/star-wars.service';
import { People } from 'src/app/models/people.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private _swService: StarWarsService) { }

  peoples: People[] = [];
  shouldHideLoad: boolean = true;

  getSearchResult(): People[] {
    return this.peoples;
  }

  ngOnInit(): void {
    this.doSearch('');
  }
  receiveSearchText(response: string) {
    this.doSearch(response);
  }

  async doSearch(text: string) {
    if(!text) {
      this.shouldHideLoad = false;
      await this._swService.getPeople().subscribe((res: any) => {
        this.peoples = res.results;
        this.shouldHideLoad = true;
      });
    } else {
      this.shouldHideLoad = false;
      await this._swService.searchPeople(text).subscribe((res: any) => {
        this.peoples = res.results;
        this.shouldHideLoad = true;
      })
    }
  }

}

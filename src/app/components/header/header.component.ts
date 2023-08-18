import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  constructor(private searchrService: SearchService) { }

  search = new FormControl('')

  chagedNav: boolean = false

  searchCharacter(): void {
    this.searchrService.addCharacter(this.search.value!)
  }

}

import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiGITService } from 'src/app/services/api-git.service';
import { Repository } from 'src/app/Repository';
import { SearchService } from 'src/app/services/search.service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(private apiGIT: ApiGITService, private searchService: SearchService) {

  }
  searchTerm: string = ''; // Variável para rastrear o termo de pesquisa
  page: number = 0;
  perPage: number= 0;


  getRepository(): void {
    if (this.searchTerm.trim() !== ''){
        this.apiGIT.getAll(this.searchTerm, this.page, this.perPage).subscribe((response: {repositories: Repository[], total_count: number}) => {
        this.searchService.setSearchTerm(this.searchTerm);
      }); 
    }
    }
}

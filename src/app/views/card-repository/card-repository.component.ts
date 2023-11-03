import { Component, OnInit } from '@angular/core';
import { GithubService } from 'src/app/service/github.service';
import { ShareDataService } from 'src/app/service/share-data.service';

@Component({
  selector: 'app-card-repository',
  templateUrl: './card-repository.component.html',
  styleUrls: ['./card-repository.component.css']
})

export class CardRepositoryComponent implements OnInit {
  
  constructor(private gbService: GithubService, private sdService : ShareDataService) {}
  
  found_result_value: number = 0;
  search_text : string = "";
  repositories : any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;

  ngOnInit() {
    this.sdService.currentSearch.subscribe((value) => {
      this.search_text = value;
      this.gbService.getRepo(this.search_text || "Node").subscribe((repositories: any) => {
        this.found_result_value = repositories.length;
        this.search_text = this.search_text;
        this.repositories = repositories;
      });
    });
  }

  lastUpdateFormat(date : Date) : string {
    var currentDate : any = new Date(Date.now());
    var lastUpdateDate : any = new Date(date);
    var update : any;
    var strToRet : string;
    update = currentDate - lastUpdateDate;

    const seconds = Math.floor(update / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days >= 365) {
      strToRet = 'Updated ' + Math.floor(days / 365) + " year(s) ago";
    } else 
    if (days > 0) {
      strToRet = 'Updated ' + days + " day(s) ago";
    } else if (hours > 0) {
      strToRet = 'Updated ' + hours + " hour(s) ago";
    } else if (minutes > 0) {
      strToRet = "Updated " + minutes + " minute(s) ago";
    } else {
      strToRet = 'Updated a few seconds ago';
    }
    return strToRet;
  }

  starsCountFormatter(value : number) : string {
    var strToRet = value.toString();
    if (value >= 1000 && value <= 9999) strToRet = value.toString().slice(0, 1) + "k";
    else if (value > 9999 && value <= 99999) strToRet = value.toString().slice(0, 2) + "k";
    else if (value > 99999 && value <= 999999) strToRet = value.toString().slice(0, 3) + "k";
    else if (value > 999999 && value <= 9999999) strToRet = value.toString().slice(0, 1) + "mi";
    else if (value > 9999999 && value <= 99999999) strToRet = value.toString().slice(0, 2) + "mi";
    else if (value > 99999999 && value <= 999999999) strToRet = value.toString().slice(0, 3) + "mi";
    return strToRet;
  }

  getVisibleRepositories() : any {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const lastIndex = startIndex + this.itemsPerPage;
    return this.repositories.slice(startIndex, lastIndex);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }
}

import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import * as dayjs from 'dayjs';
import { GithubService } from 'src/app/services/github.service';
import { GlobalService } from 'src/app/services/global.service';
import { nearestNumbers } from 'src/app/utils/helpers';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {

  // CORE ===============================================

  constructor(private githubService: GithubService, public globalService: GlobalService) {};

  // VARIABLES ==========================================

  @ViewChild('searchbar') input!: ElementRef<HTMLInputElement>;

  repos: any = null;
  query = '';
  page = 1;
  lastPage = 0;

  dropdownOpen = false;
  sortSelected = 'Best match';
  sortList = Object.keys(this.globalService.sortListObj);

  initialTime = dayjs();
  requestTime = 0;
  requestProgress = { value: 0, fade: true };
  nearestNumbers = nearestNumbers;

  // SORTING ============================================

  changeSorting(sortItem: string) {
    this.page = 1;
    this.sortSelected = sortItem;
    this.getRepos();

    this.dropdownOpen = false;
  }

  // INPUT ==============================================

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    if (event.key === "Enter") {
      if(this.requestProgress.value === 0) this.input.nativeElement.focus();
    }
  }

  handlePress(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    if (event.key === "Escape") target.blur();

    if (event.key === "Enter") {
      this.requestProgress.fade = false;
      this.requestProgress.value = 30;

      if (!target.value) {
        this.query = '';
        target.blur();

        this.requestProgress.value = 100;
        setTimeout(() => this.requestProgress.fade = true, 250);
        setTimeout(() => this.requestProgress.value = 0, 500);
        return;
      }

      this.page = 1;
      this.query = target.value;
      this.getRepos();
      
      target.blur();
    }
  }

  // NAVPAG =============================================

  switchPage(page: number) {
    this.page = page;
    this.getRepos();
    window.scrollTo(0,0);
  }

  // REQ ABSTRACTION ====================================

  getRepos(query?: string, page?: number, sort?: string) {
    this.repos = null;
    this.initialTime = dayjs();
    const localSort = this.globalService.sortListObj[this.sortSelected];
    
    this.requestProgress.fade = false;
    this.requestProgress.value = 30;

    this.githubService.getRepositories(query || this.query, page || this.page, sort || localSort)
    .subscribe(data => {
      this.repos = data;
      this.lastPage = Math.min(Math.ceil(data.total_count/10), 100);
      this.requestTime = dayjs().diff(this.initialTime, 'milliseconds');

      this.requestProgress.fade = true;
      this.requestProgress.value = 100;
      setTimeout(() => this.requestProgress.value = 0, 500);
    });
  }
}

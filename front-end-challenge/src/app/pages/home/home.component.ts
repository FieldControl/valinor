import { Component, OnInit, ViewContainerRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';
import { RepositoryRes } from 'src/app/models/repository.interface';
import { CoreHttpService } from 'src/app/services/core-http/core-http.service';
import { LoadingService } from 'src/app/services/loading/loading.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnDestroy, OnInit {

  language = '';
  languageItems: Array<any> = [];
  menuItems: Array<any> = [];
  pageIndex = 0;
  pageSize = 25;
  repositoryRes: RepositoryRes = {};
  sortOption: any;
  sortOptions: Array<any> = [];
  templates: any = {
    prefix: '',
    suffix: ' ago',
    seconds: 'less than a minute',
    minute: 'about a minute',
    minutes: '%d minutes',
    hour: 'about an hour',
    hours: 'about %d hours',
    day: 'a day',
    days: '%d days',
    month: 'about a month',
    months: '%d months',
    year: 'about a year',
    years: '%d years'
  };

  private _subscriptions = new Subscription();

  constructor(
    public loadingService: LoadingService,
    private _activatedRoute: ActivatedRoute,
    private _coreHttpService: CoreHttpService,
  ) {
  }

  async fetchRepositories(page?: any, perPage?: any, sort?: any, order?: any) {
    try {
      this.repositoryRes = await this._coreHttpService.fetchRepositories(page, perPage, sort, order, this.language).toPromise();
      // @ts-ignore: Object is possibly 'null'.
      const languages = await this._coreHttpService.fetchLanguages(this.repositoryRes.items[0].languages_url).toPromise();

      this._parseLanguages(languages);
      this._parseMenuItems([
        { label: 'Repositories', qty: this.repositoryRes.total_count },
      ]);
    } catch (error) {
      console.error(error);
    }
  }



  getIssues(issuesCount: number) {
    switch (issuesCount) {
      case 0: {
        return 'This repository has no issues';
      }
      case 1: {
        return '1 issue needs help';
      }
      default: {
        return `${issuesCount} issues needs help`;
      }
    }
  }

  getUpdatedAt(updatedAt: any) {
    if (!updatedAt) {
      return;
    }
    updatedAt = updatedAt.replace(/\.\d+/, '');
    updatedAt = updatedAt.replace(/-/, '/').replace(/-/, '/');
    updatedAt = updatedAt.replace(/T/, ' ').replace(/Z/, ' UTC');
    updatedAt = updatedAt.replace(/([\+\-]\d\d)\:?(\d\d)/, ' $1$2');
    updatedAt = new Date(updatedAt * 1000 || updatedAt);

    const now = new Date();
    const seconds = ((now.getTime() - updatedAt) * .001) >> 0;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;
    const years = days / 365;

    return this.templates.prefix + (
      seconds < 45 && this._template('seconds', seconds) ||
      seconds < 90 && this._template('minute', 1) ||
      minutes < 45 && this._template('minutes', minutes) ||
      minutes < 90 && this._template('hour', 1) ||
      hours < 24 && this._template('hours', hours) ||
      hours < 42 && this._template('day', 1) ||
      days < 30 && this._template('days', days) ||
      days < 45 && this._template('month', 1) ||
      days < 365 && this._template('months', days / 30) ||
      years < 1.5 && this._template('year', 1) ||
      this._template('years', years)
    ) + this.templates.suffix;
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  ngOnInit() {
    console.log('asd');
    const subs = this._activatedRoute.queryParams.subscribe(params => {
      if (params && params.page) {
        this.pageIndex = params.page;
        this.fetchRepositories(params.page);
      } else {
        this.fetchRepositories();
      }
    });
    this._subscriptions.add(
      this._coreHttpService.searchTerm.subscribe(term => {
        this.fetchRepositories(this.pageIndex);
      })
    );
  }

  pageChange(event: any) {
    this.pageIndex = ++event.pageIndex;
    if (this.pageSize !== event.pageSize) {
      this.pageSize = event.pageSize;
      this.fetchRepositories(this.pageIndex, this.pageSize);
    } else {
      this.fetchRepositories(this.pageIndex, event.pageSize);
    }
  }

  removeAt(array: Array<any>, index: any) {
    array.splice(index, 1);
  }

  languageSet(language: string) {
    this.language = language;
    this.fetchRepositories(this.pageIndex, this.pageSize);
  }

  sortOptionChanged($event: any) {
    const option = JSON.parse($event);
    this.fetchRepositories(this.pageIndex, this.pageSize, option.value, option.order);
  }

  private _parseLanguages(languages: any) {
    this.languageItems = [];
    const languagesArr = Object.keys(languages);
    for (const language of languagesArr) {
      this.languageItems.push({
        label: language,
        qty: languages[language]
      });
    }
  }

  private _parseMenuItems(array: any) {
    this.menuItems = [];
    array.forEach((item: any) => {
      this.menuItems.push({
        label: item.label,
        qty: this._sliceLenght(item.qty)
      });
    });
  }

  private _sliceLenght(qty: number) {
    const qtyString = qty.toString();
    switch (qtyString.length) {
      case 1:
      case 2:
      case 3: {
        return qtyString;
      }
      case 7: {
        return qtyString.slice(0, 3) + 'M';
      }
      default: {
        return qtyString.slice(0, 3) + 'K';
      }
    }
  }

  private _template(t: any, n: any) {
    return this.templates[t] && this.templates[t].replace(/%d/i, Math.abs(Math.round(n)));
  }
}

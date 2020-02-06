import { Component, OnInit, ViewContainerRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { DynamicComponentCreatorService, CoreHttpService } from 'core/services';
import { SharedHttpService } from 'shared/services';
import { RepositoryRes } from 'app/core/models/repository.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnDestroy, OnInit {

  languageItems: Array<any> = [];
  menuItems: Array<any> = [];
  pageIndex = 0;
  pageSize = 25;
  repositoryRes: RepositoryRes;
  sortOption: any;
  sortOptions: Array<any> = [];
  templates = {
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
    private _coreHttpService: CoreHttpService,
    private _dynamicComponentCreator: DynamicComponentCreatorService,
    private _viewContainerRef: ViewContainerRef,
  ) {

  }

  async fetchRepositories(page?, perPage?, sort?, order?) {
    try {
      const res = await Promise.all([
        this._coreHttpService.fetchRepositories(page, perPage, sort, order).toPromise(),
      ]);
      this.repositoryRes = res[0];
      const languages = await this._coreHttpService.fetchLanguages(this.repositoryRes.items[0].languages_url).toPromise();

      this._parseLanguages(languages);
      this._parseMenuItems([
        { label: 'Repositories', qty: res[0].total_count },
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
    // this._setSortOptions();
    this._dynamicComponentCreator.defineRootContainerRef(this._viewContainerRef);
    this.fetchRepositories('node');
    this._subscriptions.add(
      this._coreHttpService.searchTerm.subscribe(term => {
        this.fetchRepositories(term);
      })
    );
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex++;
    if (this.pageSize !== event.pageSize) {
      this.pageSize = event.pageSize;
      this.fetchRepositories(event.pageIndex, this.pageSize);
    } else {
      this.fetchRepositories(event.pageIndex, event.pageSize);
    }
  }

  removeAt(array: Array<any>, index) {
    array.splice(index, 1);
  }

  sortOptionChanged($event) {
    const option = JSON.parse($event);
    console.log(option);
    this.fetchRepositories(this.pageIndex, this.pageSize, option.value, option.order);
  }

  private _parseLanguages(languages) {
    this.languageItems = [];
    const languagesArr = Object.keys(languages);
    for (const language of languagesArr) {
      this.languageItems.push({
        label: language,
        qty: languages[language]
      });
    }
  }

  private _parseMenuItems(array) {
    this.menuItems = [];
    array.forEach(item => {
      this.menuItems.push({
        label: item.label,
        qty: this._sliceLenght(item.qty)
      });
    });
  }

  private _setSortOptions() {
    this.sortOptions = [
      {
        label: 'Best match',
        value: '',
        order: ''
      },
      {
        label: 'Most stars',
        value: 'stars',
        order: 'desc'
      },
      {
        label: 'Fewer stars',
        value: 'stars',
        order: 'asc'
      },
      {
        label: 'Most forks',
        value: 'forks',
        order: 'desc'
      },
      {
        label: 'Fewer forks',
        value: 'forks',
        order: 'asc'
      },
      {
        label: 'Recently updated',
        value: 'updated',
        order: 'desc'
      },
      {
        label: 'Least recently updated',
        value: 'updated',
        order: 'asc'
      }
    ];
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



  private _template(t, n) {
    return this.templates[t] && this.templates[t].replace(/%d/i, Math.abs(Math.round(n)));
  }
}

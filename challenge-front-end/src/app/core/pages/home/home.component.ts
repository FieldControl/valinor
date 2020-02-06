import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { DynamicComponentCreatorService, CoreHttpService } from 'core/services';
import { SharedHttpService } from 'shared/services';
import { RepositoryRes } from 'app/core/models/repository.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  languageItems: Array<any> = [];
  menuItems: Array<any> = [];
  pageIndex = 0;
  pageSize = 25;
  repositoryRes: RepositoryRes;
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


  constructor(
    private _coreHttpService: CoreHttpService,
    private _dynamicComponentCreator: DynamicComponentCreatorService,
    private _viewContainerRef: ViewContainerRef,
  ) {

  }

  async fetchRepositories(repository?, page?, perPage?) {
    try {
      this.repositoryRes = await this._coreHttpService.fetchRepositories(repository, page, perPage).toPromise();
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

  ngOnInit() {
    this._dynamicComponentCreator.defineRootContainerRef(this._viewContainerRef);
    this._setItems();
    this.fetchRepositories();
  }

  pageChange(event) {
    event.pageIndex++;
    if (this.pageSize !== event.pageSize) {
      this.pageSize = event.pageSize;
      this.fetchRepositories('node', event.pageIndex, this.pageSize);
    } else {
      this.fetchRepositories('node', event.pageIndex, event.pageSize);
    }
  }

  removeAt(array: Array<any>, index) {
    array.splice(index, 1);
  }

  private _template(t, n) {
    return this.templates[t] && this.templates[t].replace(/%d/i, Math.abs(Math.round(n)));
  }

  private _setItems() {
    this.menuItems = [{
      label: 'Repositories',
      qty: '782K'
    },
    {
      label: 'Commits',
      qty: '782K'
    },
    {
      label: 'Issues',
      qty: '782K'
    },
    {
      label: 'Packages',
      qty: '782K'
    },
    {
      label: 'Marketplace',
      qty: '782K'
    },
    {
      label: 'Topics',
      qty: '782K'
    },
    {
      label: 'Wikis',
      qty: '782K'
    },
    {
      label: 'Users',
      qty: '782K'
    }];

    this.languageItems = [{
      label: 'JavaScript',
      qty: '52392'
    },
    {
      label: 'HTML',
      qty: '24715'
    },
    {
      label: 'TypeScript',
      qty: '15672'
    },
    {
      label: 'CSS',
      qty: '9980'
    },
    {
      label: 'C++',
      qty: '8481'
    },
    {
      label: 'Shell',
      qty: '7308'
    },
    {
      label: 'Python',
      qty: '5932'
    },
    {
      label: 'Java',
      qty: '4804'
    },
    {
      label: 'CoffeeScript',
      qty: '4804'
    },
    {
      label: 'Dockerfile',
      qty: '4798'
    }];

    this.sortOptions = [
      {
        label: 'Best match',
        value: 0
      },
      {
        label: 'Most stars',
        value: 0
      }
    ];
  }
}

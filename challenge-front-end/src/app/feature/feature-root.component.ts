import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { DynamicComponentCreatorService } from 'core/services';
import { SharedHttpService } from 'shared/services';
import { DynamicComponent, ModalComponent } from 'shared/components';
import { FeatureDynamicComponent } from './components/feature-dynamic/feature-dynamic.component';

@Component({
  selector: 'app-feature-root',
  templateUrl: './feature-root.component.html',
  styleUrls: ['./feature-root.component.scss']
})
export class FeatureRootComponent implements OnInit {

  languageItems: Array<any> = [];
  menuItems: Array<any> = [];
  sortOptions: Array<any> = [];


  constructor(
    private _activatedRoute: ActivatedRoute,
    private _dynamicComponentCreator: DynamicComponentCreatorService,
    private _router: Router,
    private _sharedHttp: SharedHttpService,
    private _viewContainerRef: ViewContainerRef,
  ) {
  }

  destroy(message) {
    console.log(message);
  }

  ngOnInit() {
    this._dynamicComponentCreator.defineRootContainerRef(this._viewContainerRef);
    this._setItems();
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
      qty: '782K'
    },
    {
      label: 'HTML',
      qty: '782K'
    },
    {
      label: 'TypeScript',
      qty: '782K'
    },
    {
      label: 'CSS',
      qty: '782K'
    },
    {
      label: 'C++',
      qty: '782K'
    },
    {
      label: 'Shell',
      qty: '782K'
    },
    {
      label: 'Python',
      qty: '782K'
    },
    {
      label: 'Java',
      qty: '782K'
    },
    {
      label: 'CoffeeScript',
      qty: '782K'
    },
    {
      label: 'Dockerfile',
      qty: '782K'
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
    ]
  }
}

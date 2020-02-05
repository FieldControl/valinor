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

  removeAt(array: Array<any>, index) {
    array.splice(index, 1);
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
    ]
  }
}

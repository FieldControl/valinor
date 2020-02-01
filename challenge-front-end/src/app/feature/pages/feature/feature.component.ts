import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SharedHttpService } from 'shared/services';

@Component({
  selector: 'app-feature',
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.scss']
})
export class FeatureComponent implements OnInit {

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _sharedHttp: SharedHttpService,
  ) { }

  ngOnInit() {
    console.log('Route Snapshot: ', this._activatedRoute.snapshot);
    console.log('QueryParams: ', this._activatedRoute.snapshot.queryParams);
    console.log('Params :', this._activatedRoute.snapshot.params);
  }
}

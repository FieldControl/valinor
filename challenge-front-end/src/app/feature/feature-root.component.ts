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

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _dynamicComponentCreator: DynamicComponentCreatorService,
    private _router: Router,
    private _sharedHttp: SharedHttpService,
    private _viewContainerRef: ViewContainerRef,
  ) {
  }

  navToHome() {
    this._router.navigate(['']);
  }

  destroy(message) {
    console.log(message);
  }

  ngOnInit() {
    this._dynamicComponentCreator.defineRootContainerRef(this._viewContainerRef);
    console.log('Route Snapshot: ', this._activatedRoute.snapshot);
    console.log('QueryParams: ', this._activatedRoute.snapshot.queryParams);
    console.log('Params :', this._activatedRoute.snapshot.params);
    this._sharedHttp.postTest();
    (async () => {
      const component: FeatureDynamicComponent = await this._dynamicComponentCreator.create([FeatureDynamicComponent], 'feature', 'feature', [{ title: 'testes' }]);
      const modalComponent: FeatureDynamicComponent = await this._dynamicComponentCreator.create([ModalComponent, FeatureDynamicComponent], 'feature', 'modal', [{ title: 'testes' }], [{ destroy: (args) => { this.destroy(args) } }]);
      // Destroi o componente 2 segundos após a sua criação
      console.log(modalComponent);
      setTimeout(() => {
        console.log('Componente destruído');
        component.pop();
      }, 2000);
    })();
  }
}

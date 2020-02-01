import { Component, OnInit } from '@angular/core';
import { DynamicComponentCreatorService } from 'app/core/services';

@Component({
    selector: 'app-feature-dynamic',
    templateUrl: './feature-dynamic.component.html',
    styleUrls: ['./feature-dynamic.component.scss']
})
export class FeatureDynamicComponent implements OnInit {
    constructor(
        private _dcc: DynamicComponentCreatorService
    ) { }

    ngOnInit(): void { }
    pop() {
        this._dcc.destroy('feature');
    }
}

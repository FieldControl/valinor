import { Component, OnInit } from '@angular/core';
import { DynamicComponentCreatorService } from 'core/services';

@Component({
    selector: 'app-dynamic',
    template: `<p>app-dynamic works! </p>`,
    styles: [`
    `]
})
export class DynamicComponent implements OnInit {

    title = '';

    constructor(
        private _dcc: DynamicComponentCreatorService
    ) { }

    public ngOnInit(): void {
    }

    pop() {
        this._dcc.destroy();
    }

}

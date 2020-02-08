import { Component, OnInit, HostBinding } from '@angular/core';

import { Theme } from 'core/models/theme.enum';
import { LoadingService } from './services/loading/loading.service';

@Component({
    selector: 'app-core-root',
    template: `
        <app-header></app-header>
        <div class="spinner-container" *ngIf="loadingService.isLoading">
            <div class="spinner" >
                <div class="double-bounce1"></div>
                <div class="double-bounce2"></div>
            </div>
        </div>
        <section [class.blur]="loadingService.isLoading">
            <router-outlet></router-outlet>
        </section>
    `
})
export class CoreComponent implements OnInit {

    @HostBinding('class.theme-dark') get darkTheme(): boolean {
        if (this.theme === Theme.dark) { return true; }
    }

    @HostBinding('class.theme-light') get lightTheme(): boolean {
        if (this.theme === Theme.light) { return true; }
    }

    theme: Theme = Theme.light;

    constructor(
        public loadingService: LoadingService
    ) { }

    ngOnInit(): void { }
}

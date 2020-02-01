import { Component, OnInit, HostBinding } from '@angular/core';

import { Theme } from 'core/models/theme.enum';

@Component({
    selector: 'app-core-root',
    template: `
        <nav>NavBar</nav>
        <router-outlet></router-outlet>
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

    constructor() { }

    ngOnInit(): void { }
}

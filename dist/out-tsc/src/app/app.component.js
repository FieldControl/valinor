import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
let AppComponent = class AppComponent {
};
AppComponent = __decorate([
    Component({
        selector: 'app-root',
        standalone: true,
        imports: [RouterOutlet, MainComponent],
        template: `<app-main />`
    })
], AppComponent);
export { AppComponent };
//# sourceMappingURL=app.component.js.map
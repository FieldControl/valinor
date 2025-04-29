import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { FooterComponent } from './components/footer/footer.component';
let AppComponent = class AppComponent {
    title = 'teste';
};
AppComponent = __decorate([
    Component({
        selector: 'app-root',
        imports: [RouterOutlet, HeaderComponent, HomeComponent, FooterComponent],
        templateUrl: './app.component.html',
        styleUrl: './app.component.css'
    })
], AppComponent);
export { AppComponent };

import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
let AppModule = class AppModule {
};
AppModule = __decorate([
    NgModule({
        declarations: [
            AppComponent,
            HomeComponent
        ],
        imports: [
            BrowserModule,
            DragDropModule,
            FormsModule
        ],
        providers: [
            provideHttpClient() // Novo método recomendado
        ],
        bootstrap: [AppComponent]
    })
], AppModule);
export { AppModule };

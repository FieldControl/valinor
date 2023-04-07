import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/* angular material */
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSliderModule} from '@angular/material/slider';
import {SearchOptionsComponentComponent} from './search-options-component/search-options-component.component';
import {MatCardModule} from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';
import {ResultFilterComponentComponent} from './result-filter-component/result-filter-component.component';
import {ResultViewComponent} from './result-view/result-view.component';
import {AccordionModule} from 'ngx-bootstrap/accordion';

@NgModule({
  declarations: [
    AppComponent,
    SearchOptionsComponentComponent,
    ResultFilterComponentComponent,
    ResultViewComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatInputModule,
    MatSliderModule,
    MatCardModule,
    MatTabsModule,
    AccordionModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

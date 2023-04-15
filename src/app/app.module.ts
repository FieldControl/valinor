import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NavBarComponent } from './navBar/navBar.component';
import { FormsModule } from '@angular/forms';
import { SobreComponent } from './sobre/sobre.component';
import { FooterComponent } from './footer/footer.component';


@NgModule({
  declarations: [				
    AppComponent,
      HomeComponent,
      NavBarComponent,
      SobreComponent,
      FooterComponent
   ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { PeopleComponent } from './people/people.component';
import { StarshipsComponent } from './starships/starships.component';
import { PlanetsComponent } from './planets/planets.component';
import { FilmsComponent } from './films/films.component';
import { VehiclesComponent } from './vehicles/vehicles.component';
import { SpeciesComponent } from './species/species.component';
import { PersonComponent } from './people/person/person.component';
import { FilmComponent } from './films/film/film.component';
import { PlanetComponent } from './planets/planet/planet.component';
import { SpecieComponent } from './species/specie/specie.component';
import { StarshipComponent } from './starships/starship/starship.component';
import { VehicleComponent } from './vehicles/vehicle/vehicle.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    PeopleComponent,
    StarshipsComponent,
    PlanetsComponent,
    FilmsComponent,
    VehiclesComponent,
    SpeciesComponent,
    PersonComponent,
    FilmComponent,
    PlanetComponent,
    SpecieComponent,
    StarshipComponent,
    VehicleComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxPaginationModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

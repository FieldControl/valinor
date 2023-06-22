import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from 'src/app/shared/shared.module';

import { CardRepositoryComponent } from './components/card-repository/card-repository.component';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { SearchProfilesEffects } from './store/search-repositories.effects';
import { searchRepositoriesReducer } from './store/search-repositories.reducers';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SearchInputComponent,
    CardRepositoryComponent,
    HttpClientModule,
    EffectsModule.forFeature([SearchProfilesEffects]),
    StoreModule.forFeature('searchProfiles', searchRepositoriesReducer),
  ],
  declarations: [],
  exports: [SharedModule, SearchInputComponent, CardRepositoryComponent],
})
export class SearchProfilesModule {}

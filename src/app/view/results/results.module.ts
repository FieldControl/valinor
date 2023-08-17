import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NgxPaginationModule } from 'ngx-pagination';
import { NgIconsModule } from '@ng-icons/core';
import {
  heroMagnifyingGlass,
  heroXCircle,
  heroStar,
} from '@ng-icons/heroicons/outline';

import { ResultsComponent } from './results.component';
import { SearchInputComponent } from 'src/app/components/search-input/search-input.component';

import { GetLastUpdateRepoPipe } from 'src/app/pipes/get-last-update-repo.pipe';
import { GithubService } from 'src/app/services/github/github.service';
import { EmptySearchComponent } from 'src/app/components/empty-search/empty-search.component';
import { ErrorFeedbackComponent } from 'src/app/components/error-feedback/error-feedback.component';

@NgModule({
  declarations: [
    ResultsComponent,
    SearchInputComponent,
    GetLastUpdateRepoPipe,
    EmptySearchComponent,
    ErrorFeedbackComponent,
  ],
  imports: [
    HttpClientModule,
    CommonModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgIconsModule.withIcons({ heroMagnifyingGlass, heroXCircle, heroStar }),
  ],
  exports: [SearchInputComponent],
  providers: [GithubService],
})
export class ResultsModule {}

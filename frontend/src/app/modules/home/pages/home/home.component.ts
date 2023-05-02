import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, map, of, switchMap } from 'rxjs';
import { Repositories } from 'src/app/core/models/Repositories';
import { GithubService } from 'src/app/core/services/github.service';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // The Observable can emit values that are either arrays of `Repositories` objects or any type of data.
  repos$!: Observable<Repositories[] | any>;

  form!: FormGroup;

  // Declare a public member variable called `currentPage` and set its value to 1.
  currentPage = 1;

  // This will later be used to store error messages if there are any issues with retrieving data.
  errorMessage = '';

  // This is used to store the total number of items retrieved from the API.
  totalItems = 0;

  constructor(
    private githubService: GithubService,
    private formBuilder: FormBuilder,
    private cdRef: ChangeDetectorRef
  ) {
    this.repos$ = of([]);
  }

  ngOnInit(): void {
    this.initForm()
  }

  // This function is used to initialize a form with a single required field named "search".
  initForm() {
    // Create the form using the `formBuilder` service.
    // The form has one field (named "search") which is initially an empty string and is required.
    this.form = this.formBuilder.group({
        search: ['', [Validators.required]]
    });
  }

  // This function is called when a user searches for repositories.
  onSearchRepo(page: number) {
    this.errorMessage = "" // Reset error message.

    // Check if the search form is invalid.
    if (this.form.invalid) {
      this.errorMessage = "Field is required!" // Set error message.
      return // Exit the function early.
    }

    // Make a copy of the form value to pass to the API service.
    const formValue = {...this.form.value}

    // Call the Github API service to search for repositories.
    this.repos$ = this.githubService
    .searchRepository(formValue.search, page)
    .pipe(
      switchMap((response: any) => {
        // If no results were found, set an error message.
        if (response.total_count === 0) {
          this.errorMessage = "Not found!";
        }

        // Set the total number of items returned by the search.
        return this.totalItems = response.total_count,

        // Extract the repositories from the API response and return them.
        of(response.items)
        .pipe(
          map((items: Repositories[]) => items),
        )
      })
    )

    // Trigger change detection to update the UI with the new results.
    this.cdRef.detectChanges();
  }
}

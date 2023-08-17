import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
})
export class SearchInputComponent {
  @Input('placeholder') placeholder!: string;
  @Output() searchChanged = new EventEmitter<{ searchTerm: string }>();

  form = new FormControl();
  searchTerm = '';

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(({ searchTerm }) => {
      this.searchTerm = searchTerm;
    });

    this.form.setValue(this.searchTerm);
    this.form.valueChanges.subscribe((value) => (this.searchTerm = value));
  }

  onErase() {
    this.form.reset();
  }

  onSearch(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;

    if (!this.form.value) return;

    if (this.router.url === '/') {
      this.router.navigate(['/results'], {
        queryParams: {
          searchTerm: this.searchTerm,
        },
      });
      return;
    }

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { searchTerm: this.searchTerm },
      queryParamsHandling: 'merge',
    });

    this.searchChanged.emit({ searchTerm: this.searchTerm });
  }
}

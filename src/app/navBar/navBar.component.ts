import { Component, OnInit } from '@angular/core';
import { ApiGoogleBooksService } from 'src/services/ApiGoogleBooks.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navBar',
  templateUrl: './navBar.component.html',
  styleUrls: ['./navBar.component.css']
})
export class NavBarComponent implements OnInit {
  searchQuery: string = '';

  constructor(private apiGoogleBooksService: ApiGoogleBooksService, private router: Router) { }

  onSearch() {
    this.router.navigate(['/home'], { queryParams: { q: this.searchQuery } });
  }

  ngOnInit() {
  }
}

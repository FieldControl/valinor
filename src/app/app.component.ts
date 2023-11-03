import { Component } from '@angular/core';
import { GithubService } from './service/github.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent {
  
  found_result_value: any;
  
  constructor(private gbService: GithubService) {}

  title = 'GitHub Repository Query';
  repositories : any[] = [];
  ngOnInit() {
    this.gbService.getRepo('x').subscribe((repositories: any) => {
      this.found_result_value = repositories.length;
      this.repositories = repositories;
    });
  }

  
}

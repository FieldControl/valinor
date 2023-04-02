import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-repositories-list',
  templateUrl: './repositories-list.component.html',
  styleUrls: ['./repositories-list.component.scss']
})
export class RepositoriesListComponent implements OnInit {
  
  constructor(
    private router: Router
  ){}
  
  ngOnInit(): void {
  }

  public issuesReportadas(): void {
    this.router.navigate([`/issue`, "a", "b"]);
  }
}

import { ReposComponent } from './../../../repos/repos.component';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  providers: [ReposComponent]
})
export class HeaderComponent implements OnInit {

  @ViewChild('searchInput') input;
  query: string = "valinor";

  constructor(private reposComponent: ReposComponent) { }

  ngOnInit(): void {
  }

  search(): void {
    this.query = this.input.nativeElement.value;
    this.reposComponent.getRepos(this.query);
  }

}
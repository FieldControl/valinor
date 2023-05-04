import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card-repo',
  templateUrl: './card-repo.component.html',
  styleUrls: ['./card-repo.component.scss'],
})
export class CardRepoComponent implements OnInit {
  @Input() repo: any;
  topics: any;
  constructor() {}
  ngOnInit(): void {
    this.topics = this.repo.topics.slice(0, 5);
  }
}

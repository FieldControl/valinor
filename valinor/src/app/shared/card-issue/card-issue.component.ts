import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card-issue',
  templateUrl: './card-issue.component.html',
  styleUrls: ['./card-issue.component.scss'],
})
export class CardIssueComponent implements OnInit {
  @Input() repo: any;

  constructor() {}

  ngOnInit(): void {}
}

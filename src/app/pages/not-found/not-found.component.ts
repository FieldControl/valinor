import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { APPEARD } from 'src/app/animations/appeard.animation';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  animations: [APPEARD],
})
export class NotFoundComponent implements OnInit {
  public state = 'ready';
  public path!: string;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.path = this.router.routerState.snapshot.url;
  }
}

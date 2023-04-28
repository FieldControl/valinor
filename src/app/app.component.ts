import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  protected subscription!: Subscription;

  constructor(
    protected title: Title,
    protected router: Router,
    protected route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    const appTitle = this.title.getTitle();

    this.subscription = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          const child = this.route.firstChild;

          if (child?.snapshot.data.title) {
            return child.snapshot.data.title;
          }
        })
      )
      .subscribe((title) => this.setTitle(appTitle, title));
  }

  public setTitle(appTitle: string, title: string): void {
    appTitle
      ? this.title.setTitle(`${appTitle} - ${title}`)
      : this.title.setTitle(appTitle);
  }
}

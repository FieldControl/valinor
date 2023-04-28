import { Component, OnInit } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { APPEARD } from 'src/app/animations/appeard.animation';
import { LIST_ANIMATION_LATERAL } from 'src/app/animations/list.animation';
import { IRepo } from 'src/app/fragments/profile/profile.interface';
import { GithubService } from 'src/app/services/github.service';
import { ToastyService } from 'src/app/services/toasty.service';
import { ITable, TABLES } from './tables-page.content';

@Component({
  selector: 'app-tables-page',
  templateUrl: './tables-page.component.html',
  styleUrls: ['./tables-page.component.scss'],
  animations: [APPEARD, LIST_ANIMATION_LATERAL],
})
export class TablesPageComponent implements OnInit {
  public user: string = 'momanhaes';
  public loading: boolean = true;
  public data: IRepo[] = [];
  public show!: boolean;
  public state = 'ready';

  constructor(
    private githubService: GithubService,
    private toasty: ToastyService
  ) {}

  public get tables(): ITable[] {
    return TABLES;
  }

  ngOnInit() {
    this.getData();

    setTimeout(() => {
      this.show = true;
    }, 0);
  }

  public getData(): void {
    setTimeout(() => {
      this.githubService.getUserRepos(this.user).subscribe((repos: IRepo[]) => {
        this.data = repos;
        this.loading = false;
      });
    }, 500);
  }

  public clip(code: string): void {
    this.clipboard(code);
    this.toasty.show({ text: `${code} copiado!` });
  }

  public clipboard(word: string): void {
    const el = document.createElement('textarea');
    el.value = word;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}

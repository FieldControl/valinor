import Swal from 'sweetalert2';
import { of, Subscription } from 'rxjs';
import { ALERT_THEME } from 'src/app/utils/theme';
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { APPEARD } from 'src/app/animations/appeard.animation';
import { GithubService } from 'src/app/services/github.service';
import { WindowService } from 'src/app/services/window.service';
import { IProfile, IRepo } from 'src/app/fragments/profile/profile.interface';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs/operators';

@Component({
  selector: 'app-gh-search',
  templateUrl: './gh-search.component.html',
  styleUrls: ['./gh-search.component.scss'],
  animations: [APPEARD],
})
export class GitHubSearchComponent implements OnInit {
  public person: IProfile = {} as IProfile;
  public subscribeMobile!: Subscription;
  public repos: IRepo[] = [];
  
  public userForm!: UntypedFormGroup;
  public repoForm!: UntypedFormGroup;

  public showPagination: boolean = true;
  public isUserLoading: boolean = false;
  public isRepoLoading: boolean = false;
  public isRepo: boolean = false;
  public isMobile: boolean;
  
  public alertTheme = ALERT_THEME;
  public searchTerm!: string;
  public user: string = '';
  public state = 'ready';

  constructor(
    private githubService: GithubService,
    private windowService: WindowService,
  ) { this.isMobile = window.innerWidth <= windowService.widthMobile; }

  ngOnInit() {
    this.userForm = new UntypedFormGroup({ userControl: new UntypedFormControl('') });
    this.repoForm = new UntypedFormGroup({ repoControl: new UntypedFormControl('') });

    this.subscribeMobile = this.windowService.hasMobile.subscribe((hasMobile: boolean) => (this.isMobile = hasMobile));

    this.getUser();
    this.filterRepos();
  }

  public getUser(): void {
    this.userForm.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        switchMap((user) => {
          if (!user.userControl.trim()) {
            this.person = {} as IProfile;
            return of(null);
          }

          this.isUserLoading = true;
          this.user = user.userControl;
          return this.githubService.getUser(this.user);
        }),
        catchError((err) => {
          setTimeout(() => {
            this.isUserLoading = false;
            this.person = {} as IProfile;

            Swal.fire({
              title: 'Ops!',
              text: this.user ? `Não foi encontrado um perfil para '${this.user}'` : 'Erro',
              icon: 'error',
              background: this.alertTheme.background,
              iconColor: this.alertTheme.iconColor,
              showCancelButton: false,
              confirmButtonColor: this.alertTheme.confirmButtonColor,
              confirmButtonText: 'Ok',
            }).then(() => window.location.reload());

          }, 1000);

          return err;
        })
      )
      .subscribe((person: any) => {
        setTimeout(() => {
          this.person = person;
          this.isUserLoading = false;
        }, 1000);
      });
  }

  public filterRepos(): void {
    this.repoForm.valueChanges.subscribe((searchTerm) => {
      this.searchTerm = searchTerm.repoControl;
      this.showPagination = false;

      const result: IRepo[] = this.repos.filter(
        (item) =>
          item.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          item.language?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          item.forks?.toString().includes(this.searchTerm)
      );

      this.githubService.updateTable(result, this.searchTerm);
    });
  }

  public goProfile(): void {
    this.isRepo = false;
    this.showPagination = true;
  }

  public goRepos(user: string): void {
    this.isRepoLoading = true;

    if (!user) return;

    setTimeout(() => {
      this.githubService.getUserRepos(user).subscribe((repos) => {
        this.repos = repos;
        this.isRepo = true;
        this.isRepoLoading = false;
      });
    }, 1000);
  }
}

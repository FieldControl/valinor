import { Component, OnInit, OnDestroy } from '@angular/core';
import { GetDataApiGitHub } from '../../services/get-service';
import { ActivatedRoute } from '@angular/router';
import { of, Subscription } from 'rxjs';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})

export class UserComponent implements OnInit, OnDestroy {
  user: any;
  repos$ = of(null);
  followers$ = of(null);
  following$ = of(null);
  private subscript!: Subscription;

  isLoading: boolean = false

  constructor(
    private route: ActivatedRoute,
    private userService: GetDataApiGitHub,
  ) { }

  ngOnInit(): void {
    this.isLoading = true
    const userName = this.route.snapshot.paramMap.get('name');
    if (!userName) {
      return;
    }

    this.subscript = this.userService.getUserDetails(userName).subscribe({
      next: (data) => {
        if (data) {
          this.user = data;
          this.repos$ = this.userService.getDataByURL(data.repos_url);
          this.followers$ = this.userService.getDataByURL(data.followers_url);
          this.following$ = this.userService.getDataByURL(data.following_url);
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.userService.changeMessage([err.status]);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscript) {
      this.subscript.unsubscribe();
    }
  }

}


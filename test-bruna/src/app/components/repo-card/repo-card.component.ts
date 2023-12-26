import { Component, Input } from '@angular/core';

export interface Repo {
  id: number;
  name: string;
  private: boolean;
  description: string;
  html_url: string;
  owner: {
    login: string;
  };
}

@Component({
  selector: 'app-repo-card',
  templateUrl: './repo-card.component.html',
  styleUrl: './repo-card.component.css'
})
export class RepoCardComponent {
  @Input() repo: Repo = {
    id: 0,
    name: '',
    private: false,
    description: '',
    html_url: '',
    owner: {
      login: ''
    }
  };

  openRepo(repoUrl: string): void {
    window.open(repoUrl, '_blank');
  }
}

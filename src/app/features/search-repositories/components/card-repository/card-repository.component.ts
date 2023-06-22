import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-card-repository',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
  ],
  templateUrl: './card-repository.component.html',
  styleUrls: ['./card-repository.component.scss'],
})
export class CardRepositoryComponent {
  @Input() userPic: string;
  @Input() repositoryName: string;
  @Input() repositoryOwner: string;
  @Input() repositoryLink: string;
  @Input() repositoryStars: number;
  @Input() repositoryWatchers: number;
  @Input() repositoryDescription: string;

  onViewProfile() {
    window.open(this.repositoryLink);
  }
}

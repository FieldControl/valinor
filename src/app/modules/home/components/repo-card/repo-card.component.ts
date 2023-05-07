import { Component, Input } from '@angular/core';
import { emojify } from 'node-emoji';

import { GitHubRepo } from '@core/models/github/repo.model';

@Component({
  selector: 'app-repo-card',
  templateUrl: './repo-card.component.html',
  styleUrls: ['./repo-card.component.scss'],
})
export class RepoCardComponent {
  @Input() repository?: GitHubRepo;

  get starsCount(): string {
    if (this.repository?.starsAmount! >= 1000) {
      return `${Math.round((this.repository?.starsAmount! / 1000) * 10) / 10}k`;
    }
    return this.repository?.starsAmount.toString()!;
  }

  get updatedAgo() {
    var pushedAt = new Date(this.repository?.pushedAt!);
    var dateNow = new Date();

    var pushedAgoInMilliseconds = Math.abs(
      dateNow.getTime() - pushedAt.getTime()
    );

    var pushedAgoInHours = pushedAgoInMilliseconds / (1000 * 60 * 60);

    if (pushedAgoInHours >= 1) {
      var amountHoursTwoDays = 48;
      var amountHoursOneDay = 24;

      if (pushedAgoInHours >= amountHoursTwoDays) {
        return `on ${new Date(pushedAt.getTime()).toLocaleString()}`;
      } else if (pushedAgoInHours >= amountHoursOneDay) {
        return 'yesterday';
      }
      return `${Math.floor(pushedAgoInHours)} hours ago`;
    }

    var pushedAgoInMinutes = pushedAgoInHours * 60;
    if (pushedAgoInMinutes >= 1) {
      return `${Math.floor(pushedAgoInMinutes)} minutes ago`;
    }

    return `${Math.floor(pushedAgoInMinutes * 60)} seconds ago`;
  }

  get formattedDescription() {
    return emojify(this.repository?.description!);
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';

@Pipe({
  name: 'githubDate'
})
export class GithubDatePipe implements PipeTransform {

  transform(date: string | Date | null | undefined, args?: any): any {
    if (date === null || date === undefined) return '';
    const now = dayjs();
    const updated = dayjs(date);
    const diffInMinutes = now.diff(updated, 'minutes');

    const hourInMinutes = 60;
    const dayInMinutes = hourInMinutes * 24;
    const monthInMinutes = dayInMinutes * 30;

    // Within Minutes
    if (diffInMinutes < hourInMinutes) {
      const plural = diffInMinutes > 1 ? 's' : '';
      return diffInMinutes + ` minute${plural} ago`;
    }
    // Within Hours
    if (diffInMinutes < dayInMinutes) {
      const diffInHours = Math.floor(diffInMinutes/hourInMinutes);
      const plural = diffInHours > 1 ? 's' : '';
      return diffInHours + ` hour${plural} ago`;
    }
    // Within Days
    if (diffInMinutes > dayInMinutes && diffInMinutes < dayInMinutes*2) {
      return ' yesterday';
    }
    if (diffInMinutes < monthInMinutes) {
      const diffInDays = Math.floor(diffInMinutes/dayInMinutes);
      const plural = diffInDays > 1 ? 's' : '';
      return diffInDays + ` day${plural} ago`;
    }
    // Within Year
    if (now.diff(updated, 'year') < 1) {
      return 'on ' + updated.format('MMM D');
    }
    // Older
    return 'on ' + updated.format('MMM D, YYYY');
  }
}

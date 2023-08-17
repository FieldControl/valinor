import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getLastUpdateRepo',
})
export class GetLastUpdateRepoPipe implements PipeTransform {
  transform(value: string): string {
    const updatedDate = new Date(value);
    const timeDifferenceInSeconds = Math.floor(
      (new Date().getTime() - updatedDate.getTime()) / 1000
    );

    if (timeDifferenceInSeconds < 60) {
      return 'Updated now';
    }

    if (timeDifferenceInSeconds < 3600) {
      const minutes = Math.floor(timeDifferenceInSeconds / 60);
      return `Updated ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    if (timeDifferenceInSeconds < 86400) {
      const hours = Math.floor(timeDifferenceInSeconds / 3600);
      return `Updated ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    if (timeDifferenceInSeconds < 172800) {
      return 'Updated yesterday';
    }

    const days = Math.floor(timeDifferenceInSeconds / 86400);
    return `Updated ${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
}

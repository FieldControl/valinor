import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'starCount'
})
export class StarCountPipe implements PipeTransform {
  transform(stars: number): string {
    return StarCount(stars);
  }

}

function StarCount(stars: number): string {
  return stars > 999 ? `${Math.trunc(stars/1000)} k` : stars.toString()
}


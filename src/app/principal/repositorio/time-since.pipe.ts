import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeSince'
})
export class TimeSincePipe implements PipeTransform {
  transform(value: string): string {
    return timeSince(value);
  }
}

function timeSince(update: string) {
  const today = new Date();
  const update_at = new Date(update);
  const diffTime = Math.abs(today.getTime() - update_at.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Atualizado hoje';
  } else if (diffDays === 1) {
    return 'Atualizado há 1 dia';
  } else if(diffDays > 365) {
    const dateBr = update_at.toLocaleDateString("pt-br",{
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    return `Atualizado em ${dateBr}`;
  } else {
    return `Atualizado há ${diffDays} dias atrás`;
  }
}

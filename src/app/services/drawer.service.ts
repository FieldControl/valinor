import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DrawerService {
  private sidenavOC = new BehaviorSubject<boolean>(false);

  sidenavOC$ = this.sidenavOC.asObservable();

  toggle() {
    this.sidenavOC.next(!this.sidenavOC.value);
  }
}

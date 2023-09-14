import { Injectable } from '@angular/core';
import { Indexable } from '../utils/interfaces';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  
  theme = localStorage.getItem('theme');
  sortListObj: Indexable = {
    'Best match': '',
    'Most stars': 'sort=stars&order=desc',
    'Fewest stars': 'sort=stars&order=asc',
    'Most forks': 'sort=forks&order=desc',
    'Fewest forks': 'sort=stars&order=asc',
    'Recently updated': 'sort=updated&order=desc',
    'Least recently updated': 'sort=updated&order=asc'
  };

  constructor() { 
    if (!localStorage.getItem('theme')) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      this.theme = 'dark';
    }

    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }

  toogleTheme(): void {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      this.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      this.theme = 'dark';
    }
  }
}

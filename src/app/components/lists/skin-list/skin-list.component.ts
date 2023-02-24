import { Component, OnInit } from '@angular/core';
import { apiService } from 'src/app/service.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-skin-list',
  templateUrl: './skin-list.component.html',
  styleUrls: ['./skin-list.component.scss']
})
export class SkinListComponent implements OnInit {
  public pageSlice = this.apiService.skins.slice(0, 10);
  public value: string = '';

  constructor(public apiService: apiService) { }
  ngOnInit(): void {
    this.OnPageChange({ pageIndex: 0, pageSize: 10 } as PageEvent);
  }

  OnPageChange(event: PageEvent) {
    const startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if (endIndex > this.apiService.skins.length) {
      endIndex = this.apiService.skins.length;
    }
    this.pageSlice = this.apiService.skins.slice(startIndex, endIndex);
    this.value = ''
  }

  search(e: Event): any {
    const target = e.target as HTMLInputElement
    this.value = (target.value).toLowerCase();

    this.pageSlice = this.apiService.skins.filter((moment: any) =>
      moment.displayName.toLowerCase().includes(this.value)
    );
    return this.value

  }
}

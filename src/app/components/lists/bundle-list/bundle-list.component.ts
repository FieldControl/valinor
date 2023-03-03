import { Component, OnInit } from '@angular/core';
import { apiService } from 'src/app/service.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-bundle-list',
  templateUrl: './bundle-list.component.html',
  styleUrls: ['./bundle-list.component.scss']
})
export class BundleListComponent implements OnInit{
  public pageSlice = this.apiService.bundles.slice(0, 9);

  constructor(public apiService: apiService) { }
  ngOnInit(): void {
    this.OnPageChange({ pageIndex: 0, pageSize: 9 } as PageEvent);
  }

  OnPageChange(event: PageEvent) {
    const startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if (endIndex > this.apiService.bundles.length) {
      endIndex = this.apiService.bundles.length;
    }
    this.pageSlice = this.apiService.bundles.slice(startIndex, endIndex);
  }
}

import { Component, OnInit } from '@angular/core';
import { apiService } from 'src/app/service.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.scss'],
})
export class AgentListComponent implements OnInit {
  public pageSlice = this.apiService.agents.slice(0, 5);

  constructor(public apiService: apiService) {}
  ngOnInit(): void {
    this.OnPageChange({ pageIndex: 0, pageSize: 5 }as PageEvent);
  }

  OnPageChange(event: PageEvent) {
    const startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if (endIndex > this.apiService.agents.length) {
      endIndex = this.apiService.agents.length;
    }
    this.pageSlice = this.apiService.agents.slice(startIndex, endIndex);
  }
  
}

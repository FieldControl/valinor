import { Component } from '@angular/core';
import { apiService } from 'src/app/service.service';

@Component({
  selector: 'app-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.scss']
})
export class AgentListComponent {
  constructor(public apiService: apiService){}
}

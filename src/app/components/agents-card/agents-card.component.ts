import { Component, Input } from '@angular/core';
import { apiService } from 'src/app/service.service';

@Component({
  selector: 'app-agents-card',
  templateUrl: './agents-card.component.html',
  styleUrls: ['./agents-card.component.scss']
})
export class AgentsCardComponent{
  @Input()
  agent: string | undefined;
  
  constructor(private agentsService: apiService) {}
  
}

import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { KnowledgeComponent } from '../../components/knowledge/knowledge.component';
import { ExperiencesComponent } from '../../components/experiences/experiences.component';
import { ToolsComponent } from '../../components/tools/tools.component';
import { SoftwareComponent } from '../../components/software/software.component';
import { ChallengesComponent } from '../../components/challenges/challenges.component';
import { ImprovementsComponent } from '../../components/improvements/improvements.component';
import { ProjectsComponent } from '../../components/projects/projects.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, KnowledgeComponent, ExperiencesComponent, ToolsComponent, SoftwareComponent, ChallengesComponent, ImprovementsComponent, ProjectsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}

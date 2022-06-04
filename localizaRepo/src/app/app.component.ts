import { Component } from "@angular/core";
import { RepoService } from "./services/repo.service";

@Component({ selector: "app-root", templateUrl: "app.component.html" })
export class AppComponent {
  title = "localizaRepo";

  constructor(private repoService: RepoService) {}
}

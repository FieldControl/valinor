import { Component, OnInit } from "@angular/core";
import { RepoService } from "src/app/services/repo.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
  constructor(private repoService: RepoService) {}
  ngOnInit(): void {}

  find(query: string, page: number = 1) {
    if (query.length <= 0) {
      return;
    }

    this.repoService.searchQueryObserver.emit(query);
    this.repoService
      .find(query, page)
      .subscribe((response) =>
        this.repoService.dataChangeObserver.emit(response)
      );
  }
}

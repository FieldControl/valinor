import { Component, OnInit } from "@angular/core";
import { PaginationInstance } from "ngx-pagination";
import { RepoRepository } from "src/app/repositorie/repo-repository";
import { RepoService } from "src/app/services/repo.service";

@Component({
  selector: "app-repo-list",
  templateUrl: "./repo-list.component.html",
  styleUrls: ["./repo-list.component.css"],
})
export class RepoListComponent implements OnInit {
  query: string = "";
  repositories: RepoRepository[] = [];

  config: PaginationInstance = {
    itemsPerPage: 12,
    currentPage: 1,
    totalItems: 0,
  };

  constructor(private repoService: RepoService) {}

  ngOnInit() {
    this.repoService.searchQueryObserver.subscribe((response) => {
      if (this.query !== response) {
        this.query = response;
        this.config.currentPage = 1
      }
    });

    this.repoService.dataChangeObserver.subscribe((response) => {
      this.config.totalItems = response.total_count;
      this.repositories = response.items;
    });
  }

  OnPageChange(page: number) {
    this.config.currentPage = page;
    this.repoService
      .find(this.query, page)
      .subscribe((response) =>
        this.repoService.dataChangeObserver.emit(response)
      );
  }
}

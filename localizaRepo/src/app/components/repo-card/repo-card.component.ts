import { Component, Input, OnInit } from "@angular/core";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { PaginationInstance } from "ngx-pagination";
import { RepoRepository } from "src/app/repositorie/repo-repository";
import { RepoService } from "src/app/services/repo.service";

@Component({
  selector: "app-repo-card",
  templateUrl: "./repo-card.component.html",
  styleUrls: ["./repo-card.component.css"],
})
export class RepoCardComponent implements OnInit {
  faStar = faStar;

  @Input() query: string = "";

  @Input() receiveRepositories: RepoRepository[] = [];

  @Input() public config: PaginationInstance = {
    itemsPerPage: 12,
    currentPage: 1,
    totalItems: 0
  };

  constructor(private repoService: RepoService) {}

  ngOnInit(): void {}


}

import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { HomeRoutes } from "./home.routing.module";
import { HomeComponent } from "./pages/home/home.component";
import { ResultListComponent } from "./components/result-list/result-list.component";
import { BrowserModule } from "@angular/platform-browser";
import { NgxPaginationModule } from "ngx-pagination";

@NgModule({
    imports: [
      CommonModule,
      RouterModule.forChild(HomeRoutes),
      FormsModule,
      HttpClientModule,
      ReactiveFormsModule,
      BrowserModule,
      NgxPaginationModule
    ],
    declarations: [
      ResultListComponent,
      HomeComponent
    ],
})
export class HomeModule {}

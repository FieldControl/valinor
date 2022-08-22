import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NavBarComponent } from "./component/nav-bar/nav-bar.component";

@NgModule({
  declarations: [NavBarComponent],
  imports: [RouterModule],
  exports: [NavBarComponent],
})
export class CoreModule { }

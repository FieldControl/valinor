import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BooksComponent } from "./pages/books/books.component";
import { CharactersComponent } from "./pages/characters/characters.component";
import { DocumentsComponent } from "./pages/documents/documents.component";
import { HomeComponent } from "./pages/home/home.component";
import { MoviesComponent } from "./pages/movies/movies.component";

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'movies', component: MoviesComponent },
    { path: 'books', component: BooksComponent },
    { path: 'characters', component: CharactersComponent },
    { path: 'links', component: DocumentsComponent }
]

@NgModule({
    declarations: [],
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule { }

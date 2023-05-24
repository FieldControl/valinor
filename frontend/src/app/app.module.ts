import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpLink } from 'apollo-angular/http';
import { AppComponent } from './app.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { GitRepoService } from 'src/services/service-repo-git.service';
import { Apollo, ApolloModule } from 'apollo-angular';
import { InMemoryCache } from '@apollo/client/core';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [AppComponent, HomePageComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ApolloModule,
    AppRoutingModule,
  ],
  providers: [GitRepoService],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(apollo: Apollo, httpLink: HttpLink) {
    const uri = 'https://api.github.com/graphql';

    apollo.create({
      link: httpLink.create({
        uri,
      }),
      cache: new InMemoryCache(),
    });
  }
}

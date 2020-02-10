import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CoreHttpService } from 'app/core/services/core-http/core-http.service';
import { Subscription, iif } from 'rxjs';
import { LoadingService } from 'app/core/services/loading/loading.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  form: FormGroup;

  private _subscription = new Subscription();

  constructor(
    public loadingService: LoadingService,
    private _activatedRoute: ActivatedRoute,
    private _coreHttpService: CoreHttpService,
    private _formBuilder: FormBuilder,
    private _router: Router,
  ) {

  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  ngOnInit() {
    this.form = this._formBuilder.group({
      search: ['', [Validators.required]]
    });
    this._subscription.add(
      this._coreHttpService.searchTerm.subscribe(term => {
        this.form.get('search').setValue(term);
      })
    );
    const subs = this._activatedRoute.queryParams.subscribe((params) => {
      if (params && params.q) {
        this._coreHttpService.streamRepository(params.q);
      } else {
        this._coreHttpService.streamRepository('node');
      }
      if (subs) { subs.unsubscribe(); }
    });
  }

  search() {
    if (this.loadingService.isLoading) { return; }
    this._coreHttpService.streamRepository(this.form.get('search').value);
  }
}

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CoreHttpService } from 'app/core/services/core-http/core-http.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  form: FormGroup;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _coreHttpService: CoreHttpService,
    private _formBuilder: FormBuilder,
    private _router: Router,
  ) { }


  navToFeature() {
    this._router.navigate(['feature']);
  }

  ngOnInit() {
    this._coreHttpService.searchTerm.subscribe(term => {
      this.form.get('search').setValue(term)
    });
    this.form = this._formBuilder.group({
      search: ['node', []]
    });
  }

  search() {
    this._coreHttpService.streamRepository(this.form.get('search').value);
  }
}

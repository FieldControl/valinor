import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { LIST_ANIMATION_LATERAL } from 'src/app/animations/list.animation';
import { ToastyService } from 'src/app/services/toasty.service';
import { APPEARD } from 'src/app/animations/appeard.animation';
import { IInput, INPUTS } from './inputs-page.content';
import { EMAIL_PATTERN } from 'src/app/utils/patterns';

@Component({
  selector: 'app-inputs-page',
  templateUrl: './inputs-page.component.html',
  styleUrls: ['./inputs-page.component.scss'],
  animations: [APPEARD, LIST_ANIMATION_LATERAL],
})
export class InputsPageComponent implements OnInit {
  public form!: UntypedFormGroup;
  public state = 'ready';
  public show!: boolean;

  constructor(private toasty: ToastyService) {}

  public get inputs(): IInput[] {
    return INPUTS;
  }

  public get searchText(): string {
    return this.form.get('search')?.value;
  }

  ngOnInit() {
    this.form = new UntypedFormGroup({
      input: new UntypedFormControl(''),
      search: new UntypedFormControl(''),
      password: new UntypedFormControl(''),
      disabled: new UntypedFormControl(''),
      required: new UntypedFormControl('', [Validators.required]),
      email: new UntypedFormControl('', [Validators.pattern(EMAIL_PATTERN)]),
    });

    setTimeout(() => {
      this.show = true;
    }, 0);
  }

  public clip(code: string): void {
    this.clipboard(code);
    this.toasty.show({ text: `${code} copiado!` });
  }

  public clipboard(word: string): void {
    const el = document.createElement('textarea');
    el.value = word;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}

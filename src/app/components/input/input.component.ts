import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { APPEARD } from 'src/app/animations/appeard.animation';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  animations: [APPEARD],
})
export class InputComponent implements OnInit, AfterViewInit {
  public isRequiredError: boolean;
  public isEmailError: boolean;
  public hasError: boolean;
  public state = 'ready';

  @Input() form!: UntypedFormGroup;
  @Input() required: boolean;
  @Input() disabled: boolean;
  @Input() type!: string;
  @Input() label!: string;
  @Input() control!: string;
  @Input() placeholder!: string;

  constructor(private cdr: ChangeDetectorRef) {
    this.isRequiredError = false;
    this.isEmailError = false;
    this.hasError = false;
    this.required = false;
    this.disabled = false;
  }

  ngOnInit(): void {
    if (this.disabled) { this.form.get(this.control)?.disable({ onlySelf: true, emitEvent: false }); }
  }

  ngAfterViewInit() {
    this.form?.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.hasError = this.form.get(this.control)?.errors && (this.form.get(this.control)?.dirty || this.form.get(this.control)?.touched) ? true : false;
      this.isRequiredError = this.form.get(this.control)?.errors?.required;
      this.isEmailError = this.form.get(this.control)?.errors?.pattern;
      this.cdr.detectChanges();
    });
  }
}

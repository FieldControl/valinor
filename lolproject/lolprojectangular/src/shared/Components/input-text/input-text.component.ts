import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

const INPUT_FIELD_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TextInputComponent),
  multi: true
};

@Component({
  selector: '../input-text',
  templateUrl: '../input-text/input-text.component.html',
  styleUrls: ['../input-text/input-text.component.scss'],
  providers: INPUT_FIELD_VALUE_ACCESSOR
})
export class TextInputComponent implements ControlValueAccessor, OnInit {
  @Input() label!: string;
  @Input() placeholder!: string;
  @Input() password = false;
  @Input() control: any;
  inputType = 'text';

  private innerValue: any;

  ngOnInit() {
    if (this.password) {
      this.inputType = 'password';
    }
  }

  get value() {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCb(v);
    }
  }

  onChangeCb: (_: any) => void = () => {};
  onTouchedCb: (_: any) => void = () => {};

  writeValue(v: any): void {
    this.value = v;
  }

  registerOnChange(fn: any): void {
    this.onChangeCb = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCb = fn;
  }


}

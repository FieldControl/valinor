export interface IInput {
  name: string;
  code: string;
  label: string;
  type: string;
  control: string;
  required: boolean;
  disabled: boolean;
  placeholder: string;
  isSearch?: boolean;
}

export const INPUTS: IInput[] = [
  {
    name: 'Standard',
    code: '<app-input [form]="form" type="text" label="Padrão" control="input" [required]="false" [disabled]="false" placeholder="Input padrão"></app-input>',
    label: 'Padrão',
    type: 'text',
    control: 'input',
    required: false,
    disabled: false,
    placeholder: 'Input padrão',
  },
  {
    name: 'Required',
    code: '<app-input [form]="form" type="text" label="Required" control="required" [required]="true" [disabled]="false" placeholder="Input required"></app-input>',
    label: 'Required',
    type: 'text',
    control: 'required',
    required: true,
    disabled: false,
    placeholder: 'Input required',
  },
  {
    name: 'Disabled',
    code: '<app-input [form]="form" type="text" label="Disabled" control="disabled" [required]="false" [disabled]="true" placeholder="Input disabled"></app-input>',
    label: 'Disabled',
    type: 'text',
    control: 'disabled',
    required: false,
    disabled: true,
    placeholder: 'Input disabled',
  },
  {
    name: 'Email',
    code: '<app-input [form]="form" type="text" label="Email" control="email" [required]="false" [disabled]="false" placeholder="Input email"></app-input>',
    label: 'Email',
    type: 'email',
    control: 'email',
    required: false,
    disabled: false,
    placeholder: 'Input email',
  },
  {
    name: 'Password',
    code: '<app-input [form]="form" type="password" label="Password" control="password" [disabled]="false" placeholder="Input password"></app-input>',
    label: 'Password',
    type: 'password',
    control: 'password',
    required: false,
    disabled: false,
    placeholder: 'Input password',
  },
  {
    name: 'Search',
    code: '<app-input [form]="form" type="text" label="Search" control="search" [required]="false" [disabled]="false" placeholder="Input search"></app-input>',
    label: 'Search',
    type: 'text',
    control: 'search',
    required: false,
    disabled: false,
    placeholder: 'Input search',
    isSearch: true,
  },
];

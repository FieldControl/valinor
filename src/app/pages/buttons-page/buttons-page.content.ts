export const LOREM_IPSUM = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. 
It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, 
and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`;

export interface IButton {
  theme: string;
  label: string;
  disabled: boolean;
  code: string;
  icon?: string;
}

export interface ICollapsible {
  header: string;
  content: string;
  group: boolean;
}

export interface ISection {
  name: string;
  theme: string;
  code: string;
  collapsibles: ICollapsible[];
}

export const BUTTONS: IButton[] = [
  {
    theme: 'primary',
    label: 'Primary Icon',
    disabled: false,
    code: '<app-button theme="primary" label="Primary Icon" [disabled]="false" [icon]="fa fa-smile-o"></app-button>',
    icon: 'fa fa-smile-o',
  },
  {
    theme: 'basic',
    label: 'Basic',
    disabled: false,
    code: '<app-button theme="basic" label="Basic" [disabled]="false"></app-button>',
  },
  {
    theme: 'accent',
    label: 'Accent',
    disabled: false,
    code: '<app-button theme="accent" label="Accent" [disabled]="false"></app-button>',
  },
  {
    theme: 'warn',
    label: 'Warn',
    disabled: false,
    code: '<app-button theme="warn" label="Warn" [disabled]="false"></app-button>',
  },
  {
    theme: 'outline',
    label: 'Outline Icon',
    disabled: false,
    code: '<app-button theme="outline" label="Outline Icon" [disabled]="false" [icon]="fa fa-smile-o"></app-button>',
    icon: 'fa fa-smile-o',
  },
  {
    theme: 'outline',
    label: 'Outline',
    disabled: false,
    code: '<app-button theme="outline" label="Outline" [disabled]="false"></app-button>',
  },
  {
    theme: 'primary-disabled',
    label: 'Primary Disabled',
    disabled: true,
    code: '<app-button theme="primary-disabled" label="Primary Disabled" [disabled]="true"></app-button>',
  },
  {
    theme: 'outline',
    label: 'Outline Disabled',
    disabled: true,
    code: '<app-button theme="outline" label="Outline Disabled" [disabled]="true"></app-button>',
  },
];

export const SECTIONS: ISection[] = [
  {
    name: 'Collapsible Primary',
    theme: 'primary',
    code: '<app-collapsible theme="primary" [group]="false"></app-collapsible>',
    collapsibles: [
      {
        header: 'Clique aqui!',
        content: LOREM_IPSUM,
        group: false,
      },
      {
        header: 'Clique aqui!',
        content: LOREM_IPSUM,
        group: false,
      },
    ],
  },
  {
    name: 'Collapsible Primary Group',
    theme: 'primary',
    code: '<app-collapsible theme="primary" [group]="true"></app-collapsible>',
    collapsibles: [
      {
        header: 'Clique aqui!',
        content: LOREM_IPSUM,
        group: true,
      },
      {
        header: 'Clique aqui!',
        content: LOREM_IPSUM,
        group: true,
      },
    ],
  },
  {
    name: 'Collapsible',
    theme: 'outline',
    code: '<app-collapsible theme="outline" [group]="false"></app-collapsible>',
    collapsibles: [
      {
        header: 'Clique aqui!',
        content: LOREM_IPSUM,
        group: false,
      },
      {
        header: 'Clique aqui!',
        content: LOREM_IPSUM,
        group: false,
      },
    ],
  },
];

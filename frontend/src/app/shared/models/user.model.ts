export interface ILogin {
  email: string;
  password: string;
}

export interface IRegister extends ILogin {
  firstName: string;
  lastName: string;
}

export interface ILoginReponse {
  accessToken: string;
}

export interface IUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

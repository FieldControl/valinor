export interface ILogin {
    emailUser: string;
    passwordUser: string;
}

export interface IRegister extends ILogin {
    fistName: string;
    lastName: string;
}

export interface ILoginResponse {
    accessToken: string;
}

export interface IUser {
    idUser: number;
    emailUser: string;
    fistName: string;
    lastName: string;
}
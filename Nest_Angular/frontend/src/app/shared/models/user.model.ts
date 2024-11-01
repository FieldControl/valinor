export interface ILogin {
    email: string;
    senha: string;
}

export interface IRegister extends ILogin {
    nome: string;
    sobrenome: string;
}

export interface ILoginRespose {
    accessToken: string;
}

export interface IUser {
    id: number;
    email: string;
    nome: string;
    sobrenome: string;
}

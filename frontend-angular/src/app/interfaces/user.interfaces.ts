export interface isLongin{
    email: string;
    password: string;
}

export interface isRegister extends isLongin{
    firstname: string;
    lastname: string;
    email:string;
    password: string;
}

export interface isLonginAuth {
    accessToken: string | undefined;
}

export interface IUser{
    id: number;
    email:string;
    firstname: string;
    lastname: string;
    creatdAt: Date;
    updateAt: Date;
}
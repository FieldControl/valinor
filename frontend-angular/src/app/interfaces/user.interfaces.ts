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
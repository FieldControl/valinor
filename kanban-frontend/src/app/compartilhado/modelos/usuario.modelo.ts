export interface ILogin {
  email: string;
  senha: string;
}

export interface IRegistro extends ILogin {
  primeiroNome: string;
  sobrenome: string;
}

export interface ILoginResponse {
  acessToken: string;
}

export interface IUsuario {
  id: number;
  email: string;
  primeiroNome: string;
  sobrenome: string;
}

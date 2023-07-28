export interface SignInCommand {
  email: string;
  password: string;
}

export interface SignUpCommand {
  name: string;
  email: string;
  password: string;
  confirmationPassword: string;
}

export interface AuthToken {
  access_token: string;
}
